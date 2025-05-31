const prettyDate = (timestamp) => {
    const date = new Date(timestamp);
    const s = new Date(timestamp - date.getTimezoneOffset() * 60000).toISOString();
    return s.substr(0, 10);
};

export default prettyDate;
