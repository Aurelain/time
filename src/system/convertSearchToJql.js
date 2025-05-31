import {SEARCH_DEFAULT, SEARCH_WORKED} from './CONSTANTS';

/**
 *
 *
 */
const convertSearchToJql = ({parsedSearch, accountId}) => {
    if (parsedSearch === SEARCH_WORKED) {
        return null;
    }

    const base = `
        (
            (
                (assignee in (${accountId})) OR
                (watcher=${accountId})
            ) AND
            issuetype not in (Epic, Story) AND
            status!=Done AND
            status!=Closed AND
            status!=Resolved
        )
        `
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\( /g, '(')
        .replace(/ \)/g, ')');

    if (parsedSearch === SEARCH_DEFAULT) {
        return base;
    }

    if (parsedSearch.startsWith('AND ') || parsedSearch.startsWith('OR ')) {
        return base + ' ' + parsedSearch;
    } else {
        return parsedSearch;
    }
};

export default convertSearchToJql;
