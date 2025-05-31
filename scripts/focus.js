const modify = require('./utils/modify');
const runCommand = require('./utils/runCommand');
const findFileOrDirByPattern = require('./utils/findFileOrDirByPattern');

const PORT = 5020;

/**
 *
 */
const focus = async () => {
    const dir = __dirname + '/../src/';
    const found = findFileOrDirByPattern(dir, process.argv[2]);
    console.log('found:', found);
    if (!found) {
        console.log('Nothing found!');
        return;
    }
    const foundRelative = found
        .split('\\')
        .join('/')
        .replace(/.*?\/src\//, 'src/')
        .replace(/\.\w+$/, '');

    await modify([
        {
            // jump: require('node_modules/react-scripts/config/webpack.config.js'),
            path: 'node_modules/react-scripts/config/webpack.config.js',
            md5: '58a47ed7272041bf8e53b1a4392c0968',
            changes: [
                {
                    // We don't need "manifest.json":
                    find: /(new WebpackManifestPlugin)/,
                    replace: 'false && $1',
                },
                {
                    // We don't need a workbox:
                    find: /(new WorkboxWebpackPlugin)/,
                    replace: 'false && $1',
                },
                {
                    // Disable the warning about missing React DevTools plugin:
                    find: /(new HtmlWebpackPlugin)/,
                    replace: 'new webpack.DefinePlugin({"__REACT_DEVTOOLS_GLOBAL_HOOK__": "({isDisabled:true})"}),$1',
                },
            ],
        },
        {
            // jump: require('../node_modules/react-scripts/config/paths.js'),
            path: 'node_modules/react-scripts/config/paths.js',
            md5: '5bc48a6c8131be64f268bd952b1b0f0c',
            changes: [
                {
                    find: /src\/index/g,
                    replace: `${foundRelative}`,
                },
            ],
        },
    ]);

    runCommand('react-scripts start', {
        PORT,
        FAST_REFRESH: false, // It feels less error-prone to force a hard reload whenever the code changes
        IMAGE_INLINE_SIZE_LIMIT: 'false',
        REACT_APP_TITLE: foundRelative,
    });
};

// =====================================================================================================================
//  R U N
// =====================================================================================================================
(async () => {
    try {
        await focus();
    } catch (e) {
        console.log('Error:', e.message);
    }
})();
