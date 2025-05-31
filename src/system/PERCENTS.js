const FACTOR = 5; // how much a normal working hour weights as opposed to a night hour
const UNIT = 100 / (12 * (FACTOR + 1));
const PERCENTS = [
    UNIT, // 0
    UNIT, // 1
    UNIT, // 2
    UNIT, // 3
    UNIT, // 4
    UNIT, // 5
    UNIT, // 6
    UNIT, // 7
    UNIT * FACTOR, // 8
    UNIT * FACTOR, // 9
    UNIT * FACTOR, // 10
    UNIT * FACTOR, // 11
    UNIT * FACTOR, // 12
    UNIT * FACTOR, // 13
    UNIT * FACTOR, // 14
    UNIT * FACTOR, // 15
    UNIT * FACTOR, // 16
    UNIT * FACTOR, // 17
    UNIT * FACTOR, // 18
    UNIT * FACTOR, // 19
    UNIT, // 20
    UNIT, // 21
    UNIT, // 22
    UNIT, // 23
];

export default PERCENTS;
