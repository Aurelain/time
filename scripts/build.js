const fsExtra = require('fs-extra');
const open = require('open');
const modify = require('./utils/modify');
const runCommand = require('./utils/runCommand');

const OUTPUT_DIR = 'docs';

/**
 *
 */
const build = async () => {
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

    // For some of these options, see: https://create-react-app.dev/docs/advanced-configuration/
    // Add " --stats" to obtain a comprehensive json.
    runCommand('react-scripts build', {
        GENERATE_SOURCEMAP: 'false',
        INLINE_RUNTIME_CHUNK: 'false',
        IMAGE_INLINE_SIZE_LIMIT: 'false',
    });

    fsExtra.removeSync(OUTPUT_DIR);
    fsExtra.renameSync('build', OUTPUT_DIR);

    open(OUTPUT_DIR + '/index.html');
};

// =====================================================================================================================
//  R U N
// =====================================================================================================================
(async () => {
    try {
        await build();
    } catch (e) {
        console.log('Error:', e.message);
    }
})();
