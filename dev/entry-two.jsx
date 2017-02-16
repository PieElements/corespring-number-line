import React from 'react';
import ReactDOM from 'react-dom';
import { scaleLinear } from 'd3-scale';
import range from 'lodash/range';
import { snapTo, getInterval } from '../src/number-line/graph/tick-utils';
import Graph from '../src/number-line/graph';
import NumberLine from '../src/number-line';

class Demo extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {

    let domain = {
      min: -5,
      max: 5
    }

    let ticks = {
      major: 11,
      minor: 2
    }

    const graphProps = {
      debug: true,
      domain,
      ticks,
      width: 1000,
      height: 300,
      dots: []
    }

    return <div>
      <h1>Demo</h1>
      <div>{JSON.stringify(this.state, null, ' ')}</div>
      <hr />
      <NumberLine />
    </div>;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  let el = document.querySelector('.one');
  let r = React.createElement(Demo,
    {
      min: 0,
      max: 100,
      interval: 10,
      width: 1000,
      height: 500,
      padding: 30,
      onElementsChange: (elements) => {
        console.log('new elements: ', elements);
      },
      elements: [
        { type: 'line', size: 10, domainPosition: 10, rangePosition: 0, leftPoint: 'empty', rightPoint: 'full' },
        { type: 'line', size: 20, domainPosition: 20, rangePosition: 0, leftPoint: 'full', rightPoint: 'empty' },
        { type: 'point', pointType: 'full', domainPosition: 30, rangePosition: 0 },
        { type: 'point', pointType: 'empty', domainPosition: 50, rangePosition: 0 },
        { type: "ray", domainPosition: 60, rangePosition: 0, pointType: "full", direction: "negative" },
        { type: "ray", domainPosition: 50, rangePosition: 0, pointType: "empty", direction: "positive" }

      ]
    });
  ReactDOM.render(r, el);
});
