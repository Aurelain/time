const fs = require('fs');
const fsExtra = require('fs-extra');
const assert = require('assert');
const {resolve} = require('path');
const inquirer = require('inquirer');
const computeMd5 = require('./computeMd5');

// =====================================================================================================================
//  D E C L A R A T I O N S
// =====================================================================================================================
const BACKUPS_FOLDER = __dirname + '/modifyBackups'; // also added to .gitignore
const BACKUPS_MANIFEST = BACKUPS_FOLDER + '/manifest.json';
const ROOT = resolve(__dirname + '/../../');

// =====================================================================================================================
//  P U B L I C
// =====================================================================================================================
/**
 *
 */
const modify = async (operations) => {
    const restorationsList = await validateBackups();
    performRestorations(restorationsList);

    if (operations === null) {
        return;
    }

    const modificationsList = await validateOperations(operations);
    performModifications(modificationsList);
};

// =====================================================================================================================
//  P R I V A T E
// =====================================================================================================================
/**
 * Shape of "manifest.json":
 * - a bag of paths (relative to root directory), paired with the expected hash
 * - example:
 * {
 *     'node_modules/react-scripts/config/webpack.config.js': '8f45a2644508b5282f57fe129f62d19a',
 *     ...
 * }
 * How the original file looks in our backups folder:
 * - hash of whole path, followed by underscore and then filename. The last part is only for readability.
 * - example: "402051f4be0cc3aad33bcf3ac3d6532b_webpack.config.js
 */
const validateBackups = async () => {
    if (!fs.existsSync(BACKUPS_FOLDER)) {
        return [];
    }
    const restorationsList = [];
    const manifest = JSON.parse(fs.readFileSync(BACKUPS_MANIFEST, 'utf8'));
    for (const path in manifest) {
        const destination = resolve(ROOT + '/' + path);
        const backupFilePath = BACKUPS_FOLDER + '/' + computeMd5(path) + '_' + path.split('/').pop();

        // ---------------------------------
        if (!fs.existsSync(backupFilePath)) {
            announce('A backup is missing!', destination, backupFilePath);
            const reply = await prompt('Ignore the missing backup', 'Abort the whole process');
            if (reply === 2) {
                process.exit(0);
            }
        }

        // ---------------------------------
        if (!fs.existsSync(destination)) {
            announce('We have a backup for a file that no longer exists!', destination, backupFilePath);
            const reply = await prompt(
                'Abort the whole process',
                'Leave the target missing (do not restore backup)',
                'Restore the backup'
            );
            if (reply === 1) {
                process.exit(0);
            }
            if (reply === 2) {
                continue;
            }
        }

        // ---------------------------------
        const actualHash = computeMd5(fs.readFileSync(destination, 'utf8'));
        const expectedHash = manifest[path];
        if (actualHash !== expectedHash) {
            announce('We have a backup for a file that has changed!', destination, backupFilePath);
            console.log('Expected hash:', expectedHash);
            console.log('Actual hash:  ', actualHash);
            const reply = await prompt(
                'Abort the whole process',
                'Leave the target how it is (do not restore backup)',
                'Restore the backup'
            );
            if (reply === 1) {
                process.exit(0);
            }
            if (reply === 2) {
                continue;
            }
        }
        restorationsList.push({
            destinationPath: destination,
            backupFilePath,
        });
    }
    return restorationsList;
};

/**
 *
 */
const performRestorations = (list) => {
    if (fs.existsSync(BACKUPS_FOLDER)) {
        for (const {destinationPath, backupFilePath} of list) {
            // console.log(`Restoring "${destinationPath}"...`);
            fs.copyFileSync(backupFilePath, destinationPath);
        }
        // console.log(`Removing "${BACKUPS_FOLDER}"...`);
        fsExtra.removeSync(BACKUPS_FOLDER);
    }
};

/**
 *
 */
const validateOperations = (operations) => {
    const modificationsList = [];
    for (const {path, md5, changes} of operations) {
        const originalPath = resolve(ROOT + '/' + path);
        assert(fs.existsSync(path), `Unrecognized path "${path}"!`);
        const content = fs.readFileSync(path, 'utf8');
        const currentMd5 = computeMd5(content);
        assert(
            md5 === currentMd5,
            `Wrong md5 for "${path}"!\n` +
                `Current md5 of the file is "${currentMd5}", but you provided "${md5}".\n` +
                'You must prove you know its contents.'
        );
        assert(changes.length, `No changes provided for "${path}"!`);
        let draft = content;
        for (const {find, replace} of changes) {
            const before = draft;
            draft = draft.replace(find, replace);
            assert(draft !== before, `Nothing would change by replacing "${find}" in "${path}"!`);
        }
        modificationsList.push({
            originalPath,
            modifiedContent: draft,
        });
    }
    return modificationsList;
};

/**
 *
 */
const performModifications = (list) => {
    const manifest = {};
    fs.mkdirSync(BACKUPS_FOLDER);
    for (const {originalPath, modifiedContent} of list) {
        const relativePath = prettyPath(originalPath);
        const backupFilePath = BACKUPS_FOLDER + '/' + computeMd5(relativePath) + '_' + relativePath.split('/').pop();
        // console.log(`Backing-up "${relativePath}"...`);
        fs.copyFileSync(originalPath, backupFilePath);
        // console.log(`Modifying "${relativePath}"...`);
        fs.writeFileSync(originalPath, modifiedContent);
        manifest[relativePath] = computeMd5(modifiedContent);
    }
    fs.writeFileSync(BACKUPS_MANIFEST, JSON.stringify(manifest, null, 4));
};

/**
 *
 */
const announce = (message, target, backup) => {
    message += '\n';
    message += `    Target location: ${prettyPath(target)}\n`;
    message += `    Backup location: ${prettyPath(backup)}`;
    console.log(message);
};

/**
 *
 */
const prettyPath = (path) => {
    return resolve(path).replace(ROOT, '').split('\\').join('/');
};

/**
 *
 */
const prompt = async (...options) => {
    const choices = [];
    for (let i = 0; i < options.length; i++) {
        choices.push({name: options[i], value: i + 1});
    }
    const {reply} = await inquirer.prompt([
        {
            type: 'rawlist',
            name: 'reply',
            message: 'What do you want to do?',
            choices,
        },
    ]);
    return reply;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
module.exports = modify;
