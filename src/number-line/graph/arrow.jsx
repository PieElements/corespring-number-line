import React from 'react';

export default function Arrow(props) {

  let { x, y, direction } = props;

  let transform = `translate(${x || 0},${y})`;

  if (direction && direction === 'right') {
    transform += ` rotate(180)`
  }

  return <path
    d="m 0,0 8,-5 0,10 -8,-5"
    transform={transform}
    style={{ fill: '#000000', stroke: '#000000' }} />
}

