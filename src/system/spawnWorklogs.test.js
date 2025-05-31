import Focus from '../utils/Focus';
import spawnWorklogs from './spawnWorklogs';

const OTHER = {
    worklogId: 'other',
    accountId: 'B',
    begin: 0,
    end: 1,
};

const WORKLOGS = {
    foo: {
        worklogId: 'foo',
        accountId: 'A',
        begin: 100,
        end: 200,
    },
    bar: {
        worklogId: 'bar',
        accountId: 'A',
        begin: 300,
        end: 400,
    },
    other: OTHER,
};

// =====================================================================================================================
//  T E S T S
// =====================================================================================================================
const tests = [
    // =================================================================================================================
    // ADDITIONS
    // =================================================================================================================
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: true,
            selection: [
                {
                    begin: 0,
                    end: 50,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 0,
                end: 50,
            },
            foo: {
                worklogId: 'foo',
                accountId: 'A',
                begin: 100,
                end: 200,
            },
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: true,
            selection: [
                {
                    begin: 0,
                    end: 100,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 0,
                end: 200,
            },
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: true,
            selection: [
                {
                    begin: 0,
                    end: 250,
                },
            ],
        },
        output: {
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 0,
                end: 250,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: true,
            selection: [
                {
                    begin: 0,
                    end: 300,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 0,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: true,
            selection: [
                {
                    begin: 150,
                    end: 250,
                },
            ],
        },
        output: {
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 100,
                end: 250,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: true,
            selection: [
                {
                    begin: 50,
                    end: 51,
                },
            ],
        },
        output: {
            other: {
                worklogId: 'other',
                accountId: 'B',
                begin: 0,
                end: 1,
            },
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 50,
                end: 51,
            },
            foo: {
                worklogId: 'foo',
                accountId: 'A',
                begin: 100,
                end: 200,
            },
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // =================================================================================================================
    // DELETIONS
    // =================================================================================================================
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 0,
                    end: 50,
                },
            ],
        },
        output: null,
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 0,
                    end: 100,
                },
            ],
        },
        output: null,
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 0,
                    end: 200,
                },
            ],
        },
        output: {
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
            other: OTHER,
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 100,
                    end: 200,
                },
            ],
        },
        output: {
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
            other: OTHER,
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 0,
                    end: 110,
                },
            ],
        },
        output: {
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 110,
                end: 200,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 150,
                    end: 350,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 100,
                end: 150,
            },
            temp2: {
                worklogId: 'temp2',
                accountId: 'A',
                begin: 350,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 110,
                    end: 120,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 100,
                end: 110,
            },
            temp2: {
                worklogId: 'temp2',
                accountId: 'A',
                begin: 120,
                end: 200,
            },
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 150,
                    end: 210,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 100,
                end: 150,
            },
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 200,
                    end: 210,
                },
            ],
        },
        output: null,
    },
    // =================================================================================================================
    // DELETIONS CONSISTENCY
    // =================================================================================================================
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 99,
                    end: 100,
                },
            ],
        },
        output: null,
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 99,
                    end: 101,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 101,
                end: 200,
            },
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 99,
                    end: 200,
                },
            ],
        },
        output: {
            other: OTHER,
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 100,
                    end: 101,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 101,
                end: 200,
            },
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 100,
                    end: 200,
                },
            ],
        },
        output: {
            other: OTHER,
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 100,
                    end: 201,
                },
            ],
        },
        output: {
            other: OTHER,
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 101,
                    end: 102,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 100,
                end: 101,
            },
            temp2: {
                worklogId: 'temp2',
                accountId: 'A',
                begin: 102,
                end: 200,
            },
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 101,
                    end: 200,
                },
            ],
        },
        output: {
            other: OTHER,
            temp1: {
                worklogId: 'temp1',
                accountId: 'A',
                begin: 100,
                end: 101,
            },
            bar: {
                worklogId: 'bar',
                accountId: 'A',
                begin: 300,
                end: 400,
            },
        },
    },
    // -----------------------------------------------------------------------------------------------------------------
    {
        importance: 1,
        input: {
            worklogs: WORKLOGS,
            accountId: 'A',
            isAddition: false,
            selection: [
                {
                    begin: 200,
                    end: 201,
                },
            ],
        },
        output: null,
    },
];

// =====================================================================================================================
//  R U N
// =====================================================================================================================
Focus.run(spawnWorklogs, tests);
