/**
 * Inspired by LIVRESQ (/fe/viewer/src/core/Utils/Focus.js)
 */
const run = async (actuator, tests, config = {}) => {
    document.title = process.env.REACT_APP_TITLE.replace(/.*\//, '');

    prepareStyle(config);

    let markup = `
        <table>
            <tr>
                <th>Input</th>
                <th>Expected output</th>
                <th>Actual output (TOTAL_PERCENT%)</th>
                ${config.customColumn ? '<th>Custom</th>' : ''}
            </tr>
        `;
    const usedTests = electTests(tests);
    let okCount = 0;
    for (const test of usedTests) {
        const {input, output, error} = test;
        const inputArguments = prepareInput(input, config);
        let expectedOutput;
        if (test.hasOwnProperty('output')) {
            expectedOutput = config.expectedOutputReducer ? config.expectedOutputReducer(output) : output;
        }

        let actualOutput;
        let errorObject;
        try {
            actualOutput = actuator.apply(null, inputArguments);
            actualOutput = config.actualOutputReducer ? config.actualOutputReducer(actualOutput) : actualOutput;
        } catch (e) {
            errorObject = e;
            actualOutput = `Error: ${e.message}`;
        }
        if (error) {
            // We were expecting an error
            if (errorObject) {
                expectedOutput = actualOutput; // We were expecting an error and it happened
            } else {
                expectedOutput = 'Some error';
            }
        } else {
            // We were NOT expecting an error
            if (errorObject) {
                console.warn(errorObject.stack);
            } else {
                // Nothing, everything is fine.
            }
        }

        const isOk = isDeepEqual(expectedOutput, actualOutput);
        okCount += Number(isOk);
        const resultStyle = config.neutral ? '' : ' style="background:' + (isOk ? 'lime' : 'red') + '"';

        markup += `
            <tr>
                <td>
                    ${config.inputPrefix ? config.inputPrefix() : ''}
                    ${dump(input, config.noStringify)}
                </td>
                <td>
                    ${config.expectedOutputPrefix ? config.expectedOutputPrefix(expectedOutput) : ''}
                    ${dump(expectedOutput, config.noStringify)}
                </td>
                <td${resultStyle}>
                    ${config.actualOutputPrefix ? config.actualOutputPrefix(actualOutput) : ''}
                    ${dump(actualOutput, config.noStringify)}
                </td>
            </tr>`;
    }
    markup += '</table>';
    markup = markup.replace('TOTAL_PERCENT', Math.floor((100 * okCount) / usedTests.length));
    document.body.insertAdjacentHTML('afterbegin', markup);
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 *
 */
const electTests = (tests) => {
    const normalTests = [];
    const importantTests = [];
    for (const item of tests) {
        if (item.importance === 1) {
            normalTests.push(item);
        } else if (item.importance === 2) {
            importantTests.push(item);
        }
    }
    return importantTests.length ? importantTests : normalTests;
};

/**
 *
 */
const prepareInput = (input, config) => {
    const {inputReducer, sendInputAsArguments} = config;
    const preparedInput = inputReducer ? inputReducer(input) : input;
    return sendInputAsArguments ? preparedInput : [preparedInput];
};

/**
 *
 */
const prepareStyle = (config) => {
    const {maxRowHeight} = config;
    const styles = document.querySelectorAll('style');
    for (const style of styles) {
        style.parentNode.removeChild(style);
    }
    const maxRowHeightValue = maxRowHeight ? `${maxRowHeight}px` : 'auto';
    document.head.insertAdjacentHTML(
        'beforeend',
        `
        <style> 
            html, body {
                margin:0;
                padding:0;
                font-size:13px;
                font-family: Consolas, monospace;
            }
            * {
                box-sizing: border-box;
            }
            table {
                border-collapse: collapse;
                width: 100%;
                table-layout: fixed;
            }
            td, th {
                border-bottom: solid 1px gray;
                border-right: solid 1px gray;
                vertical-align: top;
                text-align: left;
                padding: 0;
            }
            th {
                padding: 4px;
            }
            td:last-child, th:last-child {
                border-right: none;
            }
            pre {
                width: 100%;
                overflow: auto;
                margin: 0;
                padding: 2px;
                max-height: ${maxRowHeightValue};
                white-space: pre-wrap;
                overflow-wrap: anywhere;
            }
        </style>`
    );
};

/**
 *
 */
const isDeepEqual = (a, b) => {
    if (Array.isArray(a)) {
        if (!Array.isArray(b)) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (!isDeepEqual(a[i], b[i])) {
                return false;
            }
        }
    } else if (typeof a === 'object') {
        if (typeof b !== 'object') {
            return false;
        }
        if (a === null || b === null) {
            return a === b;
        }
        if (Object.keys(a).length !== Object.keys(b).length) {
            return false;
        }
        for (var aKey in a) {
            if (aKey.startsWith('REGEX:')) {
                for (const bKey in b) {
                    if (bKey.match(new RegExp(aKey.substr(6)))) {
                        return isDeepEqual(a[aKey], b[bKey]);
                    }
                }
                return false;
            } else {
                if (!isDeepEqual(a[aKey], b[aKey])) {
                    return false;
                }
            }
        }
    } else {
        if (typeof a === 'string' && a.startsWith('REGEX:')) {
            if (typeof b !== 'string' || !b.match(new RegExp(a.substr(6)))) {
                return false;
            }
        } else {
            if (a !== b) {
                return false;
            }
        }
    }
    return true;
};

/**
 *
 * Note: An alternative would be to use <xml> (https://stackoverflow.com/a/39900317).
 */
const dump = (value, noStringify) => {
    let text = value && !noStringify ? JSON.stringify(value, null, 4) : String(value);
    text = text.split('&').join('&amp;');
    text = text.split('<').join('&lt;');
    text = text.split('>').join('&gt;');
    return '<pre>' + text + '</pre>';
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
const Focus = {
    run,
};

export default Focus;
