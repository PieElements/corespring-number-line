import React from 'react';
import ReactDOM from 'react-dom';

import Point from '../src/number-line/graph/elements/point';
import Line from '../src/number-line/graph/elements/line';

function Demo(props) {

  let xScale = (n) => n;
  xScale.invert = (n) => n;

  return <div>hi<svg>
    <g width="100" height="100">
      <Point
        empty={false}
        interval={20}
        xScale={xScale}
        y={20}
        position={20}
        bounds={{ left: -20, right: 80 }}
        onDragStop={() => { }}
        onDragStart={() => { }}
        onClick={() => { }}
        onMoveDot={() => { }}
        selected={false}
      /></g>
    <Line
      domain={{ min: 0, max: 100 }}
      position={{ left: 20, right: 60 }}
      interval={20}
      fill={{ left: true, right: false }}
      xScale={xScale} />
  </svg></div>;
}

document.addEventListener('DOMContentLoaded', () => {
  let el = document.querySelector('.one');
  let r = React.createElement(Demo);
  ReactDOM.render(r, el);
});