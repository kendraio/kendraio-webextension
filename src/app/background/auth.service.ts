import { Injectable } from '@angular/core';
import { generateCodeChallengePair } from './utils';
import { environment } from '../../environments/environment';
import { ExtensionService } from '../extension.service';

const client_id = environment.auth0_client_id;
const domain = environment.auth0_domain;

@Injectable()
export class AuthService {

  constructor(private ext: ExtensionService) { }

  logout() {
    this.ext.remove('kendraioAuthParams');
  }

  async authenticate() {
    const { code_verifier, code_challenge } = await generateCodeChallengePair(32);
    console.log({ code_verifier, code_challenge });
    const options = {
      client_id,
      code_challenge,
      redirect_uri: chrome.identity.getRedirectURL('auth0'),
      grant_type: 'authorization_code',
      code_challenge_method: 'S256',
      response_type: 'code',
      scope: 'openid profile offline_access',
    };
    const encodedOptions = Object.keys(options)
      .map(key => `${key}=${encodeURIComponent(options[key])}`)
      .join('&');
    const url = `https://${domain}/authorize?${encodedOptions}`;
    console.log({url});

    chrome.identity.launchWebAuthFlow({url, interactive: true}, (resultUrl) => {
      if (chrome.runtime.lastError) {
        // TODO: there was an error logging in
        console.error('Authentication Error', chrome.runtime.lastError.message);
        return;
      }
      const code = (new URL(resultUrl)).searchParams.get('code');
      (async () => {
        try {
          const result = await fetch(`https://${domain}/oauth/token`, {
            body: JSON.stringify({
              redirect_uri: chrome.identity.getRedirectURL('auth0'),
              grant_type: 'authorization_code',
              code_verifier,
              client_id,
              code
            }),
            method: 'POST',
            headers: {
              'content-type': 'application/json'
            }
          });
          const kendraioAuthParams = await result.json();
          console.log('setting', kendraioAuthParams);
          this.ext.set({ kendraioAuthParams }, () => console.log('Set auth params'));
        } catch (e) {
          console.error(e);
        }
      })();
    });
  }
}
