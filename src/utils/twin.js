/**
 * TODO: replace with the faster version from „/tests/BodyAlteration”
 */
const twin = (object) => {
    return JSON.parse(JSON.stringify(object));
};

export default twin;
