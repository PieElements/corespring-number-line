import range from 'lodash/range';
import uniq from 'lodash/uniq';

export function convertFrequencyToInterval(domain, tickCount, minorTickCount) {

  let { min, max } = domain;

  if (min >= max) {
    throw new Error(`min is > max: ${min} > ${max}`);
  }

  let distance = max - min;
  let minorTicks = minorTickCount > 0 ? (minorTickCount + 1) : 1;
  let normalizedMajor = tickCount - 1;

  if (isNaN(normalizedMajor)) {
    throw new Error('Tick Frequency must be 2 or higher');
  }

  if (normalizedMajor <= 0) {
    throw new Error('Tick Frequency must be 2 or higher');
  }

  let major = parseFloat(Number(distance / normalizedMajor).toFixed(4));
  let divider = normalizedMajor * minorTicks;
  let raw = distance / divider;
  let interval = parseFloat(Number(raw).toFixed(4));
  return {
    interval: interval,
    steps: minorTickCount,
    //return counts 
    counts: {
      interval: distance / interval,
      major: distance / major
    }
  };
}

export function buildTickModel(domain, ticks, scaleFn) {

  let mkRange = (min, max, interval) => {
    let raw = range(min * 1000, max * 1000, interval * 1000).map(v => v / 1000);
    //Fix the last step due to rounding errors
    raw.splice(raw.length, 1, max)
    return raw;
  }

  let rng = mkRange(domain.min, domain.max, ticks.interval);

  return rng.map((r, index) => {

    let major = (index % (ticks.steps + 1)) === 0;
    return {
      index: index,
      value: r,
      major: major,
      x: scaleFn(r)
    }
  });
}