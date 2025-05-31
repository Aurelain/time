const execSync = require('child_process').execSync;

/**
 *
 * @param command
 * @param env
 */
const runCommand = (command, env) => {
    if (env) {
        env = {...process.env, ...env};
    }
    execSync(command, {stdio: 'inherit', env});
};

module.exports = runCommand;
