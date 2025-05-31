const crypto = require('crypto');

/**
 * Could be written as a one-liner, but why?
 */
const computeMd5 = (content) => {
    const generator = crypto.createHash('md5');
    generator.update(content);
    return generator.digest('hex');
};

// =====================================================================================================================
//  E X P O R T
// =====================================================================================================================
module.exports = computeMd5;
