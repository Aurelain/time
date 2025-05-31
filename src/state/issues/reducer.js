import {combine, reduce} from '../utils';
import {
    ISSUE_SELECTION_CHANGE,
    ISSUE_SELECTION_FINISH,
    ISSUE_SELECTION_REVERT,
    ISSUE_SELECTION_START,
    ISSUES_AVAILABLE_FETCH_SUCCESS,
    ISSUES_WORKED_FETCH_SUCCESS,
} from '../action-types';
import isEmpty from '../../utils/isEmpty';
import findIcon from '../../system/findIcon';

/*
Input: A list of untouched issues, as returned by the Jira API.
Output:
{
     'EDL-80': {
            code: 'EDL-80',
            summary: 'lorem ipsum',
            conUrl: 'https://foo.atlassian.net/rest/api/2/universal_avatar/view/.../10318?size=medium",
            worklogs: {
                '10156': {
                    worklogId: '10156',
                    accountId: '5b4f54a4e3411b2c26e5f222',
                    begin: 1643733035875,
                    end: 1643733031951,
                },
                ...
            },
            isWatching: false,
            isOthersWatching: false,
     },
     ...
}
 */
const repository = reduce(
    {},
    {
        [ISSUES_AVAILABLE_FETCH_SUCCESS]: (state, {freshIssues, userAccountId, parsedSearch}) => {
            const changes = {};
            for (const issue of freshIssues) {
                const {key, fields} = issue;
                const searchKey = parsedSearch + '@' + userAccountId;
                if (key in state) {
                    // This issue already exists, so we only need to update its search:
                    changes[key] = {
                        ...state[key],
                        searches: {
                            ...state[key].searches,
                            [searchKey]: true,
                        },
                    };
                    continue;
                }

                const {issuetype, summary, worklog, watches, assignee, priority} = fields;
                changes[key] = {
                    code: key,
                    summary,
                    priority: priority.name,
                    assignee: assignee?.accountId,
                    iconUrl: findIcon(issuetype.iconUrl),
                    worklogs: generateCleanWorklogsBag(worklog.worklogs),
                    watchers: generateCleanWatchersBag(watches, userAccountId),
                    searches: {
                        [searchKey]: true,
                    },
                };
            }
            if (isEmpty(changes)) {
                return state;
            } else {
                return {...state, ...changes};
            }
        },
        [ISSUES_WORKED_FETCH_SUCCESS]: ISSUES_AVAILABLE_FETCH_SUCCESS,

        [ISSUE_SELECTION_CHANGE]: (state, {code, worklogs}) => {
            return {
                ...state,
                [code]: {
                    ...state[code],
                    worklogs,
                },
            };
        },
        [ISSUE_SELECTION_REVERT]: ISSUE_SELECTION_CHANGE,

        [ISSUE_SELECTION_FINISH]: (state, {code, resolvedIds}) => {
            if (isEmpty(resolvedIds)) {
                return state;
            }
            const worklogs = {...state[code].worklogs};
            for (const id in resolvedIds) {
                const actualId = resolvedIds[id];
                const worklog = {...worklogs[id]};
                worklog.worklogId = actualId;
                delete worklogs[id];
                worklogs[actualId] = worklog;
            }
            return {
                ...state,
                [code]: {
                    ...state[code],
                    worklogs,
                },
            };
        },
    },
    'issues.repository'
);

/**
 *
 */
const selected = reduce(
    '',
    {
        [ISSUE_SELECTION_START]: (state, {code}) => code,
        [ISSUE_SELECTION_FINISH]: '',
    },
    'issues.selected'
);

// =====================================================================================================================
//  H E L P E R S
// =====================================================================================================================
/**
 *
 */
const generateCleanWorklogsBag = (worklogsList) => {
    const bag = {};
    for (const {author, started, timeSpentSeconds, id} of worklogsList) {
        const begin = Number(new Date(started));
        bag[id] = {
            worklogId: id,
            accountId: author.accountId,
            begin,
            end: begin + timeSpentSeconds * 1000,
        };
    }
    return bag;
};

/**
 *
 */
const generateCleanWatchersBag = (watches, userId) => {
    const bag = {};
    if (!watches || !watches.isWatching) {
        return bag;
    }
    return {[userId]: true};
    // TODO: restore watchers
    // for (const {accountId} of watchers) {
    //     bag[accountId] = true;
    // }
    // return bag;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
export default combine({
    repository,
    selected,
});
