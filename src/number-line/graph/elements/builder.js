export function buildElementModel(position, elementType, domain, interval) {

  if (elementType.startsWith('p')) {
    return {
      domainPosition: position,
      type: 'point',
      pointType: elementType.endsWith('e') ? 'empty' : 'full'
    }
  } else if (elementType.startsWith('l')) {
    console.log('position? ', position);
    let left = (position + interval) <= domain.max ? position : position - interval;
    let right = left + interval;
    return {
      type: 'line',
      leftPoint: elementType.charAt(1) === 'e' ? 'empty' : 'full',
      rightPoint: elementType.charAt(2) === 'e' ? 'empty' : 'full',
      position: { left, right }
    }
  }
  //TODO: build the rest....

}