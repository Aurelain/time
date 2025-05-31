/**
 *
 */
const isPojo = (target) => Boolean(target && typeof target === 'object' && !Array.isArray(target));

export default isPojo;
