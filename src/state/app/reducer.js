import {combine, reduce} from '../utils';
import {STATUS_FAILED, STATUS_NORMAL, STATUS_REQUESTING} from '../../constants';
import {
    ISSUE_WORKLOG_ADD_ERROR,
    ISSUE_WORKLOG_ADD_REQUEST,
    ISSUE_WORKLOG_ADD_SUCCESS,
    ISSUE_WORKLOG_DELETE_ERROR,
    ISSUE_WORKLOG_DELETE_REQUEST,
    ISSUE_WORKLOG_DELETE_SUCCESS,
    ISSUES_AVAILABLE_FETCH_ERROR,
    ISSUES_AVAILABLE_FETCH_REQUEST,
    ISSUES_AVAILABLE_FETCH_SUCCESS,
    ISSUES_WORKED_FETCH_ERROR,
    ISSUES_WORKED_FETCH_REQUEST,
    ISSUES_WORKED_FETCH_SUCCESS,
    INFO_MESSAGE_HIDE,
    INFO_MESSAGE_SHOW,
    USER_INFO_FETCH_ERROR,
    USER_INFO_FETCH_SUCCESS,
    USER_LOGIN_ERROR,
    USER_LOGIN_REQUEST,
    USER_LOGIN_SUCCESS,
    OTHERS_TOGGLE,
    TIME_TRAVEL,
    SEARCH_CHANGE,
    ERROR_HIDE,
} from '../action-types';
import earlyMorning from '../../utils/earlyMorning';
import {SEARCH_DEFAULT} from '../../system/CONSTANTS';
import parseSearch from '../../system/parseSearch';

/**
 *
 */
const isInitialized = reduce(
    false,
    {
        [USER_INFO_FETCH_ERROR]: true,
        [USER_INFO_FETCH_SUCCESS]: true,
    },
    'app.isInitialized'
);

/**
 *
 */
const timestamp = reduce(
    earlyMorning(Date.now()),
    {
        [TIME_TRAVEL]: (state, {timestamp}) => timestamp,
    },
    'app.timestamp'
);

/**
 *
 */
const status = reduce(
    STATUS_NORMAL,
    {
        [ISSUES_AVAILABLE_FETCH_REQUEST]: STATUS_REQUESTING,
        [ISSUES_AVAILABLE_FETCH_ERROR]: STATUS_FAILED,
        [ISSUES_AVAILABLE_FETCH_SUCCESS]: STATUS_NORMAL,

        [ISSUES_WORKED_FETCH_REQUEST]: STATUS_REQUESTING,
        [ISSUES_WORKED_FETCH_ERROR]: STATUS_FAILED,
        [ISSUES_WORKED_FETCH_SUCCESS]: STATUS_NORMAL,

        [ISSUE_WORKLOG_DELETE_REQUEST]: STATUS_REQUESTING,
        [ISSUE_WORKLOG_DELETE_ERROR]: STATUS_FAILED,
        [ISSUE_WORKLOG_DELETE_SUCCESS]: STATUS_NORMAL,

        [ISSUE_WORKLOG_ADD_REQUEST]: STATUS_REQUESTING,
        [ISSUE_WORKLOG_ADD_ERROR]: STATUS_FAILED,
        [ISSUE_WORKLOG_ADD_SUCCESS]: STATUS_NORMAL,

        [ERROR_HIDE]: STATUS_NORMAL,
    },
    'app.status'
);

/**
 *
 */
const infoMessage = reduce(
    '',
    {
        [INFO_MESSAGE_SHOW]: (state, {text}) => text,
        [INFO_MESSAGE_HIDE]: '',
    },
    'app.infoMessage'
);

/**
 *
 */
const errorMessage = reduce(
    '',
    {
        [USER_LOGIN_ERROR]: (state, {error}) => error,
        [ISSUES_AVAILABLE_FETCH_ERROR]: USER_LOGIN_ERROR,
        [ISSUES_WORKED_FETCH_ERROR]: USER_LOGIN_ERROR,
        [ISSUE_WORKLOG_DELETE_ERROR]: USER_LOGIN_ERROR,
        [ISSUE_WORKLOG_ADD_ERROR]: USER_LOGIN_ERROR,

        [ERROR_HIDE]: '',
        [USER_LOGIN_SUCCESS]: '',
    },
    'app.errorMessage'
);

/**
 *
 */
const isLoggingIn = reduce(
    false,
    {
        [USER_LOGIN_REQUEST]: true,
        [USER_LOGIN_ERROR]: false,
        [USER_LOGIN_SUCCESS]: false,
    },
    'app.isLoggingIn'
);

/**
 *
 */
const isOthers = reduce(
    false,
    {
        [OTHERS_TOGGLE]: (state) => !state,
    },
    'app.isOthers'
);

/**
 * {
 *     2022-01-23: true,
 *     2022-01-24: true,
 *     ...
 * }
 */
const visitedDays = reduce(
    {},
    {
        [ISSUES_WORKED_FETCH_REQUEST]: (state, {day}) => {
            return {
                ...state,
                [day]: true,
            };
        },
    },
    'app.visitedDays'
);

/**
 *
 */
const search = reduce(
    SEARCH_DEFAULT,
    {
        [SEARCH_CHANGE]: (state, {value}) => value,
    },
    'app.search'
);

/**
 *
 */
const parsedSearch = reduce(
    SEARCH_DEFAULT,
    {
        [SEARCH_CHANGE]: (state, {value}) => parseSearch(value),
    },
    'app.parsedSearch'
);

export default combine({
    isInitialized,
    timestamp,
    status,
    infoMessage,
    errorMessage,
    isLoggingIn,
    isOthers,
    visitedDays,
    search,
    parsedSearch,
});
