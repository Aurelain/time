const fs = require('fs');
const path = require('path');

/**
 *
 */
const findFileOrDirByPattern = (dir, pathOrPattern) => {
    if (fs.existsSync(pathOrPattern)) {
        return path.resolve(pathOrPattern);
    } else {
        const pattern = new RegExp(pathOrPattern);
        return scan(dir, pattern);
    }
};

/**
 *
 */
const scan = (dir, pattern) => {
    const items = fs.readdirSync(dir);
    for (const item of items) {
        const fullPath = path.join(dir, item);
        if (fullPath.match(pattern)) {
            return fullPath;
        }
        if (fs.statSync(fullPath).isDirectory()) {
            const result = scan(fullPath, pattern);
            if (result) {
                return result;
            }
        }
    }
    return null;
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
module.exports = findFileOrDirByPattern;
