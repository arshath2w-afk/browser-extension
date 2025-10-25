import {browser} from 'webextension-polyfill-ts';
import {DEFAULT_SETTINGS} from '../UserAgents';

browser.runtime.onInstalled.addListener(async (): Promise<void> => {
  try {
    const {ua_settings} = await browser.storage.local.get('ua_settings');
    if (!ua_settings) {
      await browser.storage.local.set({ua_settings: DEFAULT_SETTINGS});
    }
  } catch {
    // ignore
  }
  console.log('🦄', 'extension installed');
});
