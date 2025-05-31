/**
 *
 */
const dumpTimes = (target) => {
    return console.log(JSON.stringify(target, null, 4).replace(/\b\d{13}\b/g, timestampsReplacer));
};

/**
 *
 */
const timestampsReplacer = (matched) => {
    const timestamp = Number(matched);
    const date = new Date(timestamp);
    return new Date(timestamp - date.getTimezoneOffset() * 60000).toISOString();
};

export default dumpTimes;
