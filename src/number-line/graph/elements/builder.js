export function buildElementModel(position, elementType, domain, interval) {
  if (elementType.startsWith('p')) {
    return {
      position: position,
      type: 'point',
      pointType: elementType.endsWith('e') ? 'empty' : 'full'
    }
  } else if (elementType.startsWith('l')) {
    let left = (position + interval) <= domain.max ? position : position - interval;
    let right = left + interval;
    return {
      type: 'line',
      leftPoint: elementType.charAt(1) === 'e' ? 'empty' : 'full',
      rightPoint: elementType.charAt(2) === 'e' ? 'empty' : 'full',
      position: { left, right }
    }
  } else if (elementType.startsWith('r')) {
    let full = elementType.charAt(1) === 'f';
    let positive = elementType.charAt(2) === 'p';
    return {
      type: 'ray',
      direction: positive ? 'positive' : 'negative',
      pointType: full ? 'full' : 'empty',
      position: position
    }
  }
}
