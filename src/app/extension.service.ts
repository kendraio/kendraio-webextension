import { Injectable } from '@angular/core';
import * as jwtDecode from 'jwt-decode';

@Injectable()
export class ExtensionService {

  constructor() { }

  get(defaultValue, callback) {
    chrome.storage.local.get(defaultValue, callback);
  }

  set(value, callback) {
    chrome.storage.local.set(value, callback);
  }

  remove(item) {
    chrome.storage.local.remove(item);
  }

  initTagger(callback) {
    chrome.runtime.sendMessage({ type: 'taggerGetInfo' }, callback);
  }

  getUserToken(callback) {
    this.get('kendraioAuthParams', item => {
      // console.log({ item });
      if (item && item.kendraioAuthParams) {
        const auth = item.kendraioAuthParams;
        // console.log({ auth });
        if (auth.id_token) {
          return callback(auth.id_token);
        }
      }
      callback(false);
    });
  }

  getUser(callback) {
    this.getUserToken(token => {
      if (token) {
        callback(jwtDecode(token));
      }
      callback(false);
    });
  }

  setBackgroundListener(listener) {
    chrome.runtime.onMessage.addListener(listener);
  }

  setMenuListener(listener) {
    chrome.contextMenus.create({
      id: "image-tagger",
      title: 'Tag Image (Kendraio)',
      contexts: ["image"]
    }, () => {
      // console.log('Added context menu item');
    });
    chrome.contextMenus.onClicked.addListener(listener);
  }

  sendMessage(type) {
    chrome.runtime.sendMessage({ type });
  }
}
