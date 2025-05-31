import {SEARCH_DEFAULT, SEARCH_WORKED} from './CONSTANTS';

/**
 *
 *
 */
const parseSearch = (search) => {
    search = search.trim().replace(/\s+/g, ' ');
    if (search === SEARCH_DEFAULT || search === SEARCH_WORKED) {
        return search;
    }
    if (search === 'AND' || search === 'OR') {
        return SEARCH_DEFAULT;
    }
    if (search.startsWith('AND ') || search.startsWith('OR ')) {
        return parseExtraSearch(search);
    }
    if (search.match(/^[A-Z]+-\d+$/)) {
        return `issueKey=${search}`;
    }

    let jql = search.split('jql=')[1];
    if (jql) {
        jql = decodeURIComponent(jql);
    } else {
        if (search.match(/[^a-zA-Z0-9_ -]/)) {
            // contains strange characters, so most likely this is a jql syntax
            jql = search;
        } else {
            jql = `text ~ "${search}"`;
        }
    }

    return jql;
};

/**
 *
 *
 */
const parseExtraSearch = (search) => {
    const parts = search.match(/^(.*?) (.*)/);
    const operator = parts[1];
    const extra = parts[2];
    if (extra.startsWith('AND ') || extra.startsWith('OR ')) {
        return SEARCH_DEFAULT;
    }
    return operator + ' ' + parseSearch(extra);
};

export default parseSearch;
