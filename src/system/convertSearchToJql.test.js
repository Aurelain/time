import Focus from '../utils/Focus';
import convertSearchToJql from './convertSearchToJql';

const BASE = `
        (
            (
                (assignee in (12345)) OR
                (watcher=12345)
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

// =====================================================================================================================
//  T E S T S
// =====================================================================================================================
const tests = [
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            parsedSearch: 'Default',
            accountId: '12345',
        },
        output: BASE,
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            parsedSearch: 'Worked',
            accountId: '12345',
        },
        output: null,
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            parsedSearch: 'issueKey=EDL-1957',
            accountId: '12345',
        },
        output: 'issueKey=EDL-1957',
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            parsedSearch: 'text ~ "tren" order by created DESC',
            accountId: '12345',
        },
        output: 'text ~ "tren" order by created DESC',
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            parsedSearch: 'AND labels not in (premature)',
            accountId: '12345',
        },
        output: BASE + ' AND labels not in (premature)',
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            parsedSearch: 'OR labels not in (premature)',
            accountId: '12345',
        },
        output: BASE + ' OR labels not in (premature)',
    },
];

// =====================================================================================================================
//  R U N
// =====================================================================================================================
Focus.run(convertSearchToJql, tests);
