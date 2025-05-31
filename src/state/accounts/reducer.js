import {combine, reduce} from '../utils';
import {ISSUES_AVAILABLE_FETCH_SUCCESS, ISSUES_WORKED_FETCH_SUCCESS} from '../action-types';
import isEmpty from '../../utils/isEmpty';

/**
 * Input: A list of untouched issues, as returned by the Jira API.
 * Output:
 * {
 *      5b4f54a4e3411b2c26e5f221: {
 *          name: 'John Doe',
 *          avatar: 'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/5...1/.../32",
 *      },
 *      ...
 * }
 */
const bag = reduce(
    {},
    {
        [ISSUES_AVAILABLE_FETCH_SUCCESS]: (state, {freshIssues, userAccountId}) => {
            if (!freshIssues.length) {
                return state;
            }
            const freshUsers = {};
            for (const {fields} of freshIssues) {
                if (!fields) {
                    // We've already parsed this issue.
                    continue;
                }
                const {assignee} = fields;
                if (!assignee) {
                    continue;
                }
                const {accountId} = assignee;
                if (state[accountId] || accountId === userAccountId) {
                    continue;
                }
                freshUsers[accountId] = {
                    name: assignee.displayName,
                    avatar: assignee.avatarUrls['32x32'],
                };
            }
            if (isEmpty(freshUsers)) {
                return state;
            }
            return {...state, ...freshUsers};
        },
        [ISSUES_WORKED_FETCH_SUCCESS]: ISSUES_AVAILABLE_FETCH_SUCCESS,
    },
    'bag'
);

export default combine({
    bag,
});
