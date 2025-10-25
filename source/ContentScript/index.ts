import {browser} from 'webextension-polyfill-ts';
import {UASettings, DEFAULT_SETTINGS, resolveUAString, platformForCategory} from '../UserAgents';

type InjectionPayload = {
  ua: string;
  platformProp: string;
  uaPlatformLabel: string;
  mobile: boolean;
};

async function loadSettings(): Promise<UASettings> {
  try {
    const {ua_settings} = await browser.storage.local.get('ua_settings');
    return ua_settings || DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function buildInjectionScript(payload: InjectionPayload): string {
  // Run in page context to override navigator properties early
  function overrideInPage(data: InjectionPayload) {
    const define = (obj: any, prop: string, value: any) => {
      try {
        Object.defineProperty(obj, prop, {
          get: () => value,
          configurable: true,
        });
      } catch {
        // ignore
      }
    };

    const ua = data.ua;
    const platformProp = data.platformProp;
    const uaPlatformLabel = data.uaPlatformLabel;
    const isMobile = data.mobile;

    // Override legacy properties
    define(navigator, 'userAgent', ua);
    define(navigator, 'appVersion', ua);
    define(navigator, 'platform', platformProp);

    // UA-CH (Client Hints) override with a minimal mock
    if ('userAgentData' in navigator) {
      try {
        const brands = [
          {brand: 'Chromium', version: '120'},
          {brand: 'Not_A Brand', version: '99'},
          {brand: 'Google Chrome', version: '120'},
        ];
        const fake = {
          brands,
          mobile: isMobile,
          platform: uaPlatformLabel,
          toJSON() {
            return {brands: this.brands, mobile: this.mobile, platform: this.platform};
          },
          async getHighEntropyValues(hints: string[]) {
            const result: Record<string, any> = {
              brands,
              mobile: isMobile,
              platform: uaPlatformLabel,
            };
            for (const hint of hints) {
              switch (hint) {
                case 'architecture':
                  result.architecture = 'x86';
                  break;
                case 'bitness':
                  result.bitness = '64';
                  break;
                case 'model':
                  result.model = '';
                  break;
                case 'uaFullVersion':
                  result.uaFullVersion = '120.0.0.0';
                  break;
                case 'fullVersionList':
                  result.fullVersionList = brands.map((b) => ({brand: b.brand, version: b.version}));
                  break;
                case 'wow64':
                  result.wow64 = false;
                  break;
                default:
                  // leave untouched
                  break;
              }
            }
            return result;
          },
        };
        define(navigator, 'userAgentData', fake);
      } catch {
        // ignore
      }
    }

    // Re-apply on history navigation changes for SPAs
    try {
      const reapply = () => {
        define(navigator, 'userAgent', ua);
        define(navigator, 'appVersion', ua);
        define(navigator, 'platform', platformProp);
      };
      const pushState = history.pushState;
      const replaceState = history.replaceState;
      history.pushState = function (...args) {
        const ret = pushState.apply(this, args as any);
        reapply();
        return ret;
      };
      history.replaceState = function (...args) {
        const ret = replaceState.apply(this, args as any);
        reapply();
        return ret;
      };
      window.addEventListener('popstate', reapply);
    } catch {
      // ignore
    }
  }

  return `(${overrideInPage.toString()})(${JSON.stringify(payload)});`;
}

function inject(payload: InjectionPayload): void {
  try {
    const script = document.createElement('script');
    script.textContent = buildInjectionScript(payload);
    // Ensure the script runs as early as possible
    (document.head || document.documentElement).appendChild(script);
    script.remove();
  } catch {
    // ignore
  }
}

async function applyUA(): Promise<void> {
  const settings = await loadSettings();
  let ua = resolveUAString(settings);

  if (settings.mode === 'random') {
    try {
      const {ua_last} = await browser.storage.local.get('ua_last');
      if (settings.randomizeOnEachPage) {
        ua = resolveUAString(settings);
        await browser.storage.local.set({ua_last: ua});
      } else {
        ua = ua_last || resolveUAString(settings);
        if (!ua_last) {
          await browser.storage.local.set({ua_last: ua});
        }
      }
    } catch {
      // ignore storage errors; fall back to computed UA
    }
  } else {
    // manual mode, keep last for consistency
    try {
      await browser.storage.local.set({ua_last: ua});
    } catch {
      // ignore
    }
  }

  const platformInfo = platformForCategory(settings.category);
  inject({
    ua,
    platformProp: platformInfo.platformProp,
    uaPlatformLabel: platformInfo.uaPlatformLabel,
    mobile: platformInfo.mobile,
  });
}

// Initial run
applyUA();

// Allow triggering re-injection from popup/options
browser.runtime.onMessage.addListener(async (message) => {
  if (message && message.type === 'applyUAOverrideNow') {
    await applyUA();
  }
  // no response required
  return undefined;
});

export {};
