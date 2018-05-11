
export function getIdToken() {
  const authParams = JSON.parse(localStorage.getItem('kendraio.authParams'));
  if (authParams && authParams.id_token) {
    return authParams.id_token;
  }
  throw new Error('No Auth Token');
}

export function isLoggedIn() {
  // const authParams = JSON.parse(localStorage.getItem('kendraio.authParams'));
  // return !!(authParams && authParams.id_token);
  try {
    getIdToken();
    return true;
  }
  catch (e) {
    return false;
  }
}
