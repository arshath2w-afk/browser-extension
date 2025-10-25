import * as React from 'react';
import {browser, Tabs} from 'webextension-polyfill-ts';
import {UASettings, DEFAULT_SETTINGS} from '../UserAgents';

import './styles.scss';

const categories: {key: UASettings['category']; label: string}[] = [
  {key: 'windows', label: 'Windows'},
  {key: 'mac', label: 'macOS'},
  {key: 'linux', label: 'Linux'},
  {key: 'android', label: 'Android'},
  {key: 'ios', label: 'iOS'},
  {key: 'custom', label: 'Custom'},
];

async function openWebPage(url: string): Promise<Tabs.Tab> {
  return browser.tabs.create({url});
}

async function getActiveTabId(): Promise<number | undefined> {
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  const tab = tabs[0];
  return tab?.id;
}

const Popup: React.FC = () => {
  const [settings, setSettings] = React.useState<UASettings>(DEFAULT_SETTINGS);
  const [saved, setSaved] = React.useState<boolean>(false);

  React.useEffect(() => {
    (async () => {
      try {
        const {ua_settings} = await browser.storage.local.get('ua_settings');
        setSettings(ua_settings || DEFAULT_SETTINGS);
      } catch {
        setSettings(DEFAULT_SETTINGS);
      }
    })();
  }, []);

  const saveSettings = async (): Promise<void> => {
    await browser.storage.local.set({ua_settings: settings});
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const applyNow = async (): Promise<void> => {
    const tabId = await getActiveTabId();
    if (typeof tabId === 'number') {
      try {
        await browser.tabs.sendMessage(tabId, {type: 'applyUAOverrideNow'});
      } catch {
        // content script may not be ready or tab may not match; ignore
      }
    }
  };

  return (
    <section id="popup">
      <h2>User-Agent Switcher</h2>

      <div className="form__row">
        <label htmlFor="ua-mode">Mode</label>
        <div id="ua-mode">
          <label>
            <input
              type="radio"
              name="ua-mode"
              checked={settings.mode === 'manual'}
              onChange={() => setSettings({...settings, mode: 'manual'})}
            />
            Manual
          </label>
          <label>
            <input
              type="radio"
              name="ua-mode"
              checked={settings.mode === 'random'}
              onChange={() => setSettings({...settings, mode: 'random'})}
            />
            Random
          </label>
        </div>
      </div>

      <div className="form__row">
        <label htmlFor="ua-category">Platform</label>
        <select
          id="ua-category"
          value={settings.category}
          onChange={(e) =>
            setSettings({...settings, category: e.target.value as UASettings['category']})
          }
        >
          {categories.map((c) => (
            <option key={c.key} value={c.key}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {settings.category === 'custom' ? (
        <div className="form__row">
          <label htmlFor="ua-custom">Custom UA string</label>
          <textarea
            id="ua-custom"
            rows={3}
            placeholder="Paste a full User-Agent string"
            value={settings.customString || ''}
            onChange={(e) => setSettings({...settings, customString: e.target.value})}
          />
        </div>
      ) : null}

      <div className="form__row">
        <label>
          <input
            type="checkbox"
            checked={settings.randomizeOnEachPage}
            onChange={(e) =>
              setSettings({...settings, randomizeOnEachPage: e.target.checked})
            }
          />
          Randomize on each page load
        </label>
      </div>

      <div className="actions">
        <button type="button" onClick={saveSettings}>
          Save
        </button>
        <button type="button" onClick={applyNow}>
          Apply on current tab
        </button>
        <button type="button" onClick={() => openWebPage('options.html')}>
          Options
        </button>
      </div>

      {saved ? <p className="status ok">Saved!</p> : null}

      <div className="links__holder">
        <ul>
          <li>
            <button
              type="button"
              onClick={(): Promise<Tabs.Tab> => {
                return openWebPage(
                  'https://github.com/abhijithvijayan/web-extension-starter'
                );
              }}
            >
              Template Repo
            </button>
          </li>
        </ul>
      </div>
    </section>
  );
};

export default Popup;
