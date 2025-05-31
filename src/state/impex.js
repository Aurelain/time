import store from './store';
import {getSearch, getTimestamp} from './app/selectors';
import earlyMorning from '../utils/earlyMorning';
import isPojo from '../utils/isPojo';
import isPositiveInteger from '../utils/isPositiveInteger';
import isEmpty from '../utils/isEmpty';
import {searchChange, timeTravel} from './app/actions';
import {SEARCH_DEFAULT} from '../system/CONSTANTS';
import {issuesAvailableFetch} from './issues/actions';
import {getAccountId, getImpersonatedEmail} from './user/selectors';
import {impersonatedEmailChange, userInfoFetch} from './user/actions';

/*

   ------------       ------------       ------------      ------------
   |  REDUX   | -----|  internal | -----|  external| -----|   hash   |
   ------------      ------------       ------------      ------------

*/

/**
 *
 */
const setupImpex = () => {
    window.addEventListener('hashchange', onWindowHashChange);
    decodeHash();
    store.subscribe(onStoreChange);
};

/**
 *
 */
const onWindowHashChange = () => {
    decodeHash();
};

/**
 *
 */
const decodeHash = () => {
    const cleanHash = window.location.hash.substr(1);
    let hashPojo;
    try {
        hashPojo = cleanHash ? JSON.parse(decodeURIComponent(escape(atob(cleanHash)))) : {};
        if (!isPojo(hashPojo)) {
            hashPojo = {};
        }
    } catch (e) {
        hashPojo = {};
        console.error(e);
    }
    const externalPojo = convertHashToExternal(hashPojo);
    applyExternalChanges(externalPojo);
};

/**
 *
 */
const convertHashToExternal = (hashPojo) => {
    const externalPojo = {};

    const timestamp = hashPojo.timestamp;
    if (isPositiveInteger(timestamp)) {
        externalPojo.timestamp = timestamp;
    } else {
        externalPojo.timestamp = earlyMorning(Date.now());
    }

    const search = hashPojo.search;
    if (search && typeof search === 'string') {
        externalPojo.search = search;
    } else {
        externalPojo.search = SEARCH_DEFAULT;
    }

    const {impersonation} = hashPojo;
    if (impersonation && typeof impersonation === 'string') {
        externalPojo.impersonation = impersonation;
    } else {
        externalPojo.impersonation = '';
    }

    return externalPojo;
};

/**
 *
 */
const applyExternalChanges = (externalPojo) => {
    const internalPojo = getInternalPojo();
    const {dispatch} = store;

    if (internalPojo.timestamp !== externalPojo.timestamp) {
        dispatch(timeTravel(externalPojo.timestamp));
    }

    if (internalPojo.search !== externalPojo.search) {
        dispatch(searchChange(externalPojo.search));
        if (getAccountId(store.getState())) {
            dispatch(issuesAvailableFetch());
        }
    }
    if (internalPojo.impersonation !== externalPojo.impersonation) {
        dispatch(impersonatedEmailChange(externalPojo.impersonation));
        if (getAccountId(store.getState())) {
            dispatch(userInfoFetch());
            dispatch(issuesAvailableFetch());
        }
    }
};

/**
 *
 */
const getInternalPojo = () => {
    const state = store.getState();
    return {
        timestamp: getTimestamp(state),
        search: getSearch(state),
        impersonation: getImpersonatedEmail(state),
    };
};

/**
 *
 */
const onStoreChange = () => {
    const internalPojo = getInternalPojo();
    const hashPojo = convertInternalToHash(internalPojo);
    const futureHash = isEmpty(hashPojo) ? '' : btoa(unescape(encodeURIComponent(JSON.stringify(hashPojo))));
    if (futureHash !== window.location.hash.substr(1)) {
        window.location.hash = futureHash;
    }
};

/**
 *
 */
const convertInternalToHash = ({timestamp, search, impersonation}) => {
    const hashPojo = {};

    if (timestamp !== earlyMorning(Date.now())) {
        hashPojo.timestamp = timestamp;
    }

    if (search !== SEARCH_DEFAULT) {
        hashPojo.search = search;
    }

    if (impersonation) {
        hashPojo.impersonation = impersonation;
    }

    return hashPojo;
};

setupImpex();
