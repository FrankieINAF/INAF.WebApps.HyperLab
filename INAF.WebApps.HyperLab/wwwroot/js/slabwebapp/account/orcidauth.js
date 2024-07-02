async function initAuth() {
    let baseUrl = 'https://orcid.org/oauth/authorize';

    let result = await doAjaxGetNoModelCorsAsync('https://orcid.org/oauth/authorize?client_id=APP-28MJC162XY2CSSCT&response_type=code&scope=/authenticate&redirect_uri=http://150.146.134.42/Account/Login');
    if (result) {
        console.log(result);
    }
}