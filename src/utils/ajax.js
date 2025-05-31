import {JIRA_URL, PROXY_URL} from '../constants';

/**
 *
 * @param url
 * @param config
 */
const ajax = async (url, config) => {
    const result = await ajaxCore(url, config);
    console.groupCollapsed((result.error ? 'ERROR! ' : '') + url);
    console.log('config', config);
    console.log('response:', result);
    console.groupEnd();
    return result;
};

/**
 *
 */
const ajaxCore = async (url, config) => {
    const email = localStorage.getItem('email');
    const token = localStorage.getItem('token');
    if (!email || !token) {
        return {error: 'Missing credentials!'};
    }

    let response;
    try {
        response = await fetch(PROXY_URL, {
            ...config,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Basic ' + btoa(email + ':' + token),
                'X-Proxy-URL': btoa(JIRA_URL + '/rest/api/3/' + url),
            },
        });
    } catch (e) {
        console.error('Fetch failed!', e);
        return {
            error: e.message,
        };
    }

    const data = await response.text();
    if (!data) {
        return {
            payload: '',
        };
    }

    let payload;
    try {
        payload = JSON.parse(data);
    } catch (e) {
        console.log('JSON parse failed! Response follows:');
        console.log(data);
        return {
            error: e.message,
        };
    }
    if (payload.error) {
        return {
            error: payload.error,
        };
    }
    const error = payload.error || payload.errors || payload.errorMessages;
    if (error) {
        return {
            error: JSON.stringify(error),
        };
    }
    return {payload};
};

export default ajax;
