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

// class Point {
//   static build(data) {
//     let { position, full } = data;
//     return new Point(position, full)
//   }
//   constructor(position, full) {
//     this.position = position;
//     this.full = full;
//   }
// }

// class Ray {
//   static build(data) {
//     let { position, full, direction } = data;
//     return new Ray(position, full, direction);
//   }
//   constructor(position, full, direction) {
//     this.position = position;
//     this.full = full;
//     this.direction = direction;
//   }
// }

// class Line {
//   static build(data) {
//     let { position, fill } = data;
//     return new Line(position, fill);
//   }

//   constructor(position, fill) {
//     this.position = position;
//     this.fill = fill;
//   }
// }