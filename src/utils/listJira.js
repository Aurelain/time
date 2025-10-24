import ajax from './ajax';

const MAX_ISSUES = 300;

/**
 *
 */
const listJira = async (singleRequest) => {
    // return [];
    const issues = [];
    const maxResults = 100;
    let startAt = 0;
    let count = 0;
    while (true) {
        if (count++ > 3) {
            // failsafe
            break;
        }
        if (issues.length >= MAX_ISSUES) {
            console.log(`Reached the cap at ${MAX_ISSUES}!`);
            issues.length = MAX_ISSUES;
            return issues;
        }
        const url = singleRequest + `&startAt=${startAt}&maxResults=${100}`;
        if (startAt) {
            console.log(`Getting issues from ${startAt} to ${startAt + maxResults - 1}...`);
        }
        const {payload, error} = await ajax(url);
        if (error) {
            throw new Error(error);
        }
        issues.push(...payload.issues);
        startAt += maxResults;
        if (payload.isLast || payload.total - 1 < startAt) {
            break;
        }
    }

    console.log(`Found ${issues.length} issues.`);
    return issues;
};

export default listJira;
