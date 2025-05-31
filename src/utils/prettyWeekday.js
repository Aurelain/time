const DAYS = ['DUMINICĂ', 'LUNI', 'MARȚI', 'MIERCURI', 'JOI', 'VINERI', 'SÂMBĂTĂ'];

const prettyWeekday = (timestamp) => {
    return DAYS[new Date(timestamp).getDay()];
};

export default prettyWeekday;
