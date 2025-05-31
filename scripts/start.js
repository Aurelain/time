const modify = require('./utils/modify');
const runCommand = require('./utils/runCommand');

const PORT = 3020;

/**
 *
 */
const start = async () => {
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
    ]);

    runCommand('react-scripts start', {
        PORT,
        FAST_REFRESH: false, // It feels less error-prone to force a hard reload whenever the code changes
        IMAGE_INLINE_SIZE_LIMIT: 'false',
    });
};

// =====================================================================================================================
//  R U N
// =====================================================================================================================
(async () => {
    try {
        await start();
    } catch (e) {
        console.log('Error:', e.message);
    }
})();
