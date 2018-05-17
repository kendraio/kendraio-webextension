
export async function generateCodeChallengePair(length) {
  const randomBytes = getRandomBytes(length);
  // console.log('random', randomBytes);
  const code_verifier = _arrayBufferToBase64(base64URLEncode(randomBytes));
  const code_challenge = _arrayBufferToBase64(base64URLEncode(await sha256(randomBytes)));
  // console.log({ code_verifier, code_challenge });
  return { code_verifier, code_challenge };
}

function getRandomBytes(length) {
  const code_verifier = new Uint32Array(length);
  window.crypto.getRandomValues(code_verifier);
  return code_verifier;
}

function base64URLEncode(str) {
  // console.log(str);
  // console.log(str.toString('base64'));
  return str.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function _arrayBufferToBase64( buffer ) {
  let binary = '';
  let bytes = new Uint8Array( buffer );
  let len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode( bytes[ i ] );
  }
  return window.btoa( binary );
}

async function sha256(buffer) {
  return await window.crypto.subtle.digest('SHA-256', buffer);
}
