/**
 * User agent profiles and settings utilities.
 */

export type UAPlatform = 'windows' | 'mac' | 'linux' | 'android' | 'ios' | 'custom';

export type UASettings = {
  mode: 'manual' | 'random';
  category: UAPlatform;
  customString?: string;
  randomizeOnEachPage: boolean;
};

export const DEFAULT_SETTINGS: UASettings = {
  mode: 'manual',
  category: 'windows',
  randomizeOnEachPage: false,
};

export const UA_DB: Record<Exclude<UAPlatform, 'custom'>, string[]> = {
  windows: [
    // Chrome on Windows 10/11
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    // Edge on Windows (Chromium)
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  ],
  mac: [
    // Chrome on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    // Safari on macOS
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  ],
  linux: [
    // Chrome on Linux
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:119.0) Gecko/20100101 Firefox/119.0',
    // Brave/Vivaldi generally use Chromium UA; keep it generic
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  ],
  android: [
    // Chrome on Android
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36',
    // Firefox on Android
    'Mozilla/5.0 (Android 13; Mobile; rv:119.0) Gecko/119.0 Firefox/119.0',
  ],
  ios: [
    // Safari on iPhone
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    // Safari on iPad
    'Mozilla/5.0 (iPad; CPU OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
    // Chrome on iOS (WebKit based; UA resembles Safari with CriOS token)
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/120.0.0.0 Mobile/15E148 Safari/604.1',
  ],
};

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function resolveUAString(settings: UASettings): string {
  if (settings.category === 'custom' && settings.customString) {
    return settings.customString;
  }

  const categories = Object.keys(UA_DB) as (keyof typeof UA_DB)[];
  const selected =
    settings.mode === 'random'
      ? settings.category === 'custom'
        ? pickRandom(UA_DB[pickRandom(categories)])
        : pickRandom(UA_DB[settings.category])
      : UA_DB[(settings.category === 'custom' ? 'windows' : settings.category) as Exclude<UAPlatform, 'custom'>][0];

  return selected;
}

export function platformForCategory(category: UAPlatform): { platformProp: string; uaPlatformLabel: string; mobile: boolean } {
  switch (category) {
    case 'windows':
      return { platformProp: 'Win32', uaPlatformLabel: 'Windows', mobile: false };
    case 'mac':
      return { platformProp: 'MacIntel', uaPlatformLabel: 'macOS', mobile: false };
    case 'linux':
      return { platformProp: 'Linux x86_64', uaPlatformLabel: 'Linux', mobile: false };
    case 'android':
      return { platformProp: 'Android', uaPlatformLabel: 'Android', mobile: true };
    case 'ios':
      return { platformProp: 'iPhone', uaPlatformLabel: 'iOS', mobile: true };
    case 'custom':
    default:
      // fall back to current platform heuristics; most sites read navigator.platform
      return { platformProp: navigator.platform || 'Win32', uaPlatformLabel: 'Unknown', mobile: false };
  }
}