import range from 'lodash/range';
import uniq from 'lodash/uniq';

export function getInterval(domain, ticks) {
  let { min, max } = domain;
  let { major, minor } = ticks;

  if (min >= max) {
    throw new Error(`min is > max: ${min} > ${max}`);
  }

  let distance = max - min;
  let minorTicks = minor > 0 ? (minor + 1) : 1;
  let normalizedMajor = major - 1;

  if (isNaN(normalizedMajor)) {
    throw new Error('Tick Frequency must be 2 or higher');
  }

  if (normalizedMajor <= 0) {
    throw new Error('Tick Frequency must be 2 or higher');
  }

  let divider = normalizedMajor * minorTicks;
  let raw = distance / divider;
  return parseFloat(Number(raw).toFixed(4));
}

let mkRange = (min, max, interval) => {
  let raw = range(min, max, interval);
  /* Fix the last step due to rounding errors */
  raw.splice(raw.length, 1, max)
  return raw;
}

export function snapTo(min, max, interval, value) {

  if (value >= max) {
    return max;
  }

  if (value <= min) {
    return min;
  }

  let rng = mkRange(min, max, interval);

  rng = rng.filter(v => {
    return Math.abs(value - v) <= interval;
  });

  let closest = rng.reduce((prev, curr) => {
    let currentDistance = Math.abs(curr - value);
    let previousDistance = Math.abs(prev - value);
    return currentDistance <= previousDistance ? curr : prev;
  });

  return closest;
}

export function buildTickModel(domain, ticks, interval, scaleFn) {

  let rng = mkRange(domain.min, domain.max, interval);

  return rng.map((r, index) => {

    let isMajor = (index % (ticks.minor + 1)) === 0;

    return {
      value: r,
      major: isMajor,
      x: scaleFn(r)
    }
  });
}