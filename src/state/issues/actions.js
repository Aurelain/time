import {
    ISSUE_SELECTION_CHANGE,
    ISSUE_SELECTION_FINISH,
    ISSUE_SELECTION_REVERT,
    ISSUE_SELECTION_START,
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
} from '../action-types';
import ajax from '../../utils/ajax';
import {getAccountId} from '../user/selectors';
import {getIssuesRepository, getIssueWorklogs} from './selectors';
import {getParsedSearch, getTimestamp, getVisitedDays} from '../app/selectors';
import prettyDate from '../../utils/prettyDate';
import {MILLISECONDS_IN_A_DAY} from '../../constants';
import spawnWorklogs from '../../system/spawnWorklogs';
import subtract from '../../system/subtract';
import prettyTime from '../../utils/prettyTime';
import listJira from '../../utils/listJira';
import convertSearchToJql from '../../system/convertSearchToJql';
import {SEARCH_WORKED} from '../../system/CONSTANTS';

// =====================================================================================================================
//  A C T I O N   C R E A T O R S
// =====================================================================================================================
/**
 *
 */
export const issuesAvailableFetch = () => async (dispatch, getState) => {
    dispatch({
        type: ISSUES_AVAILABLE_FETCH_REQUEST,
    });

    const state = getState();
    const repository = getIssuesRepository(state);
    const accountId = getAccountId(state);
    const parsedSearch = getParsedSearch(state);

    let issues;
    try {
        const cleanJql = convertSearchToJql({parsedSearch, accountId});
        if (cleanJql) {
            const jql = buildJql(cleanJql);
            issues = await listJira(`search?jql=${jql}&fields=summary,issuetype,worklog,watches,assignee,priority`);
        } else {
            issues = [];
        }
    } catch (e) {
        dispatch({
            type: ISSUES_AVAILABLE_FETCH_ERROR,
            error: e.message,
        });
        return;
    }

    let freshIssues;
    try {
        freshIssues = await exploreIssues(issues, repository);
    } catch (e) {
        console.error('Failed to investigate available issues!', e);
        dispatch({
            type: ISSUES_AVAILABLE_FETCH_ERROR,
            error: e.message,
        });
        return;
    }

    dispatch({
        type: ISSUES_AVAILABLE_FETCH_SUCCESS,
        freshIssues,
        userAccountId: accountId,
        parsedSearch,
    });

    dispatch(issuesWorkedFetch());
};

/**
 *
 */
export const issuesWorkedFetch = () => async (dispatch, getState) => {
    const state = getState();
    const timestamp = getTimestamp(state);
    const begin = prettyDate(timestamp);
    const end = prettyDate(timestamp + MILLISECONDS_IN_A_DAY + 1);
    const visitedDays = getVisitedDays(state);
    const repository = getIssuesRepository(state);
    const accountId = getAccountId(state);

    if (begin in visitedDays) {
        return;
    }

    dispatch({
        type: ISSUES_WORKED_FETCH_REQUEST,
        day: begin,
    });

    const jql = buildJql(`
        worklogAuthor in (${accountId}) AND
        worklogDate>=${begin} AND
        worklogDate<${end}
        `);

    // We don't need creator because it's needed only for watchers adjustment, and we don't care about
    // watchers in the worked section.
    let issues;
    try {
        issues = await listJira(`search?jql=${jql}&fields=summary,issuetype,worklog,priority`);
    } catch (e) {
        dispatch({
            type: ISSUES_WORKED_FETCH_ERROR,
            error: e.message,
        });
        return;
    }

    let freshIssues;
    try {
        freshIssues = await exploreIssues(issues, repository);
    } catch (e) {
        console.error('Failed to investigate worked issues!', e);
        dispatch({
            type: ISSUES_WORKED_FETCH_ERROR,
            error: e.message,
        });
        return;
    }

    dispatch({
        type: ISSUES_WORKED_FETCH_SUCCESS,
        freshIssues,
        userAccountId: accountId,
        parsedSearch: SEARCH_WORKED,
    });
};

/**
 *
 * @param code
 */
export const issueSelectionStart = (code) => ({
    type: ISSUE_SELECTION_START,
    code,
});

/**
 *
 * @param code
 * @param originalWorklogs
 * @param forbidden
 * @param isAddition
 * @param begin
 * @param end
 */
export const issueSelectionChange =
    (code, originalWorklogs, forbidden, isAddition, begin, end) => (dispatch, getState) => {
        const state = getState();
        const selection = createSelection(isAddition, begin, end, forbidden);

        const worklogs =
            spawnWorklogs({
                worklogs: originalWorklogs,
                accountId: getAccountId(state),
                isAddition,
                selection,
            }) || originalWorklogs;

        if (getIssueWorklogs(state, code) !== worklogs) {
            dispatch({
                type: ISSUE_SELECTION_CHANGE,
                code,
                worklogs,
            });
        }
    };

/**
 *
 * @param code
 * @param originalWorklogs
 * @param worklogs
 */
export const issueSelectionFinish = (code, originalWorklogs, worklogs) => async (dispatch) => {
    const resolvedIds = {};
    for (const id in originalWorklogs) {
        if (!(id in worklogs)) {
            if (!(await deleteWorklog(code, id, dispatch, originalWorklogs[id]))) {
                return;
            }
        }
    }
    for (const id in worklogs) {
        if (!(id in originalWorklogs)) {
            const worklog = await addWorklog(code, worklogs[id], dispatch, worklogs[id]);
            if (!worklog) {
                return;
            }
            resolvedIds[id] = worklog.id;
        }
    }
    dispatch({
        type: ISSUE_SELECTION_FINISH,
        code,
        resolvedIds,
    });
};

/**
 *
 * @param code
 * @param originalWorklogs
 */
export const issueSelectionRevert = (code, originalWorklogs) => ({
    type: ISSUE_SELECTION_REVERT,
    code,
    worklogs: originalWorklogs,
});

// =====================================================================================================================
//  H E L P E R S
// =====================================================================================================================
/**
 *
 */
const buildJql = (s) => {
    return encodeURIComponent(s.trim().replace(/\s+/g, ' '));
};

/**
 * Returns a list of fresh issues (that were not already part of the repository).
 * Each issue:
 * - is guaranteed to contain all the worklogs (even when they have more than 20 entries).
 * - is guaranteed to contain all the watchers (accountIds)
 */
const exploreIssues = async (list, repository) => {
    const fresh = [];

    for (const issue of list) {
        const {key, fields} = issue;
        if (key in repository) {
            fresh.push({
                key,
            });
            continue;
        }
        let freshIssue = issue;
        const {worklog} = fields;
        const {total, worklogs} = worklog;
        if (worklogs.length !== total) {
            freshIssue = {
                ...freshIssue,
                fields: {
                    ...fields,
                    worklog: {
                        ...worklog,
                        worklogs: await fetchIssueWorklogs(key),
                    },
                },
            };
        }
        fresh.push(freshIssue);
    }
    return fresh;
};

/**
 *
 */
const fetchIssueWorklogs = async (key) => {
    const {payload, error} = await ajax(`issue/${key}/worklog`);
    if (error) {
        throw new Error(error);
    }
    return payload.worklogs;
};

/**
 *
 */
const createSelection = (isAddition, begin, end, forbidden) => {
    if (isAddition) {
        let output = [{begin, end}];
        for (const forbiddenInterval of forbidden) {
            const freshOutput = [];
            for (const interval of output) {
                const subtraction = subtract(
                    interval.begin,
                    interval.end,
                    forbiddenInterval.begin,
                    forbiddenInterval.end
                );
                switch (subtraction) {
                    case null: {
                        // completely removed
                        break;
                    }
                    case false: {
                        // nothing changed
                        freshOutput.push(interval);
                        break;
                    }
                    default: {
                        // we have new intervals
                        freshOutput.push(...subtraction);
                    }
                }
                output = freshOutput;
            }
        }
        return output;
    } else {
        return [{begin, end}];
    }
};

/**
 *
 */
const deleteWorklog = async (code, id, dispatch, worklog) => {
    console.log('DELETE ' + prettyTime(worklog.begin) + '-' + prettyTime(worklog.end));
    dispatch({
        type: ISSUE_WORKLOG_DELETE_REQUEST,
    });
    const {payload, error} = await ajax(`issue/${code}/worklog/${id}`, {
        method: 'DELETE',
    });
    if (error) {
        dispatch({
            type: ISSUE_WORKLOG_DELETE_ERROR,
            error,
        });
        return;
    }
    if (payload !== '') {
        dispatch({
            type: ISSUE_WORKLOG_DELETE_ERROR,
            error: 'Payload should be empty!',
        });
        return;
    }
    dispatch({
        type: ISSUE_WORKLOG_DELETE_SUCCESS,
    });
    return true;
};

/**
 *
 */
const addWorklog = async (code, {begin, end}, dispatch, worklog) => {
    console.log('ADD ' + prettyTime(worklog.begin) + '-' + prettyTime(worklog.end));
    dispatch({
        type: ISSUE_WORKLOG_ADD_REQUEST,
    });

    const body = {
        timeSpentSeconds: Math.round((end - begin) / 1000),
        started: `${new Date(begin).toISOString().replace('Z', '+0000')}`,
    };
    //
    const {payload, error} = await ajax(`issue/${code}/worklog`, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    if (error) {
        dispatch({
            type: ISSUE_WORKLOG_ADD_ERROR,
            error,
        });
        return;
    }
    dispatch({
        type: ISSUE_WORKLOG_ADD_SUCCESS,
    });
    return payload;
};
