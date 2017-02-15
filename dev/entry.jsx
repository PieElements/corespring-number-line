import React from 'react';
import ReactDOM from 'react-dom';

import Point from '../src/number-line/graph/elements/point';
import Line from '../src/number-line/graph/elements/line';
import { scaleLinear } from 'd3-scale';
import range from 'lodash/range';

class Demo extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      linePosition: {
        left: 10,
        right: 30
      }
    }
  }

  render() {

    let { padding, width, height, min, max } = this.props;

    let xScale = scaleLinear()
      .domain([min, max])
      .range([padding, width - padding]);

    let tester = scaleLinear()
      .domain([0, 10])
      .range([1, 5]);

    let interval = 10;

    let gridLines = range(min, max + interval, interval).map(r => {
      let x = xScale(r);
      return <line y1="0" y2={height} x1={x} x2={x} stroke="rgba(155,0,100,0.3)" />
    });

    let moveLine = (p) => {
      this.setState({ linePosition: p });
    }

    return <div>
      <h1>Demo</h1>
      <div>{JSON.stringify(this.state, null, ' ')}</div>
      <svg width={width} height={height}>
        {gridLines}
        <Point
          empty={false}
          interval={interval}
          xScale={xScale}
          y={20}
          position={30}
          bounds={{ left: -30, right: 70 }}
          onDragStop={() => { }}
          onDragStart={() => { }}
          onClick={() => { }}
          onMoveDot={() => { }}
          selected={false}
        />
        <Point
          empty={true}
          interval={interval}
          xScale={xScale}
          y={40}
          position={20}
          bounds={{ left: -20, right: 80 }}
          onDragStop={() => { }}
          onDragStart={() => { }}
          onClick={() => { }}
          onMoveDot={() => { }}
          selected={false}
        />
        <Line
          domain={{ min: min, max: max }}
          moveLine={moveLine}
          position={this.state.linePosition}
          interval={10}
          y={60}
          fill={{ left: true, right: false }}
          xScale={xScale} />
      </svg>
    </div>;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let el = document.querySelector('.one');
  let r = React.createElement(Demo, { min: 0, max: 100, width: 700, height: 500, padding: 200 });
  ReactDOM.render(r, el);
});
