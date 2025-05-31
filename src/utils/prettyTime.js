const prettyTime = (timestamp) => {
    const date = new Date(timestamp);
    const s = new Date(timestamp - date.getTimezoneOffset() * 60000).toISOString();
    return s.substr(11, 5);
};

export default prettyTime;
