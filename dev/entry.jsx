import React from 'react';
import ReactDOM from 'react-dom';

import Point from '../src/number-line/graph/elements/point';
import Line from '../src/number-line/graph/elements/line';
import Ray from '../src/number-line/graph/elements/ray';

import { scaleLinear } from 'd3-scale';
import range from 'lodash/range';
import { snapTo, getInterval } from '../src/number-line/graph/tick-utils';

class Demo extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      lineSelected: false,
      line: {
        position: {
          left: 10,
          right: 100
        }
      }
    }
  }

  getChildContext() {
    let { min, max, width } = this.props;
    return {
      xScale: this.getXScale(),
      snapValue: this.getSnapValue()
    };
  }

  getXScale() {
    let { min, max, width, padding } = this.props;
    let range = [
      padding,
      width - padding];

    // console.log('getXScale', min, max, width, padding, range);
    return scaleLinear()
      .domain([min, max])
      .range(range);
  }


  getSnapValue() {
    let { min, max, width, padding, interval } = this.props;
    return snapTo.bind(null, min, max, interval);
  }

  render() {

    let onLineClick = () => {
      console.log(this.state);
      this.setState({
        lineSelected: !this.state.lineSelected,
      });
    }

    let { interval, padding, width, height, min, max } = this.props;

    let xScale = this.getXScale();

    let gridLines = range(min, max + interval, interval).map(r => {
      let x = xScale(r);
      return <line key={r} y1="0" y2={height} x1={x} x2={x} stroke="rgba(155,0,100,0.3)" />
    });

    let moveLine = (p) => {
      this.setState({ line: { position: p } });
    }

    let els = this.props.elements.map((el, index) => {

      let y = (index + 1) * 20;
      if (el.type === 'line') {
        let position = { left: el.domainPosition, right: el.domainPosition + el.size }
        let fill = { left: el.leftPoint === 'full', right: el.rightPoint === 'full' };
        return <Line
          domain={{ min: min, max: max }}
          moveLine={moveLine}
          position={position}
          selected={el.selected}
          onClick={() => { }}
          interval={interval}
          y={y}
          fill={fill}
          xScale={xScale} />
      } else if (el.type === 'point') {

        let bounds = { left: min - el.domainPosition, right: max - el.domainPosition };

        return <Point
          empty={el.pointType === 'empty'}
          interval={interval}
          y={y}
          position={el.domainPosition}
          bounds={bounds}
          onDragStop={() => { }}
          onDragStart={() => { }}
          onClick={() => { }}
          onMoveDot={() => { }}
          selected={el.selected}
        />
      } else if (el.type === 'ray') {
        // let position = { left: el.domainPosition, right: el.domainPosition + el.size }
        let fill = { left: el.leftPoint === 'full', right: el.rightPoint === 'full' };
        return <Ray
          domain={{ min: min, max: max }}
          direction={el.direction}
          moveLine={moveLine}
          position={el.domainPosition}
          selected={el.selected}
          onClick={() => { }}
          interval={interval}
          y={y}
          empty={el.pointType === 'empty'}
          xScale={xScale} />
      }


    });

    return <div>
      <h1>Demo</h1>
      <div>{JSON.stringify(this.state, null, ' ')}</div>
      <svg width={width} height={height}>
        <rect fill="none" stroke="#3099ec" width={width} height={height}></rect>
        {gridLines}
        {els}
        {/*<Point
          empty={false}
          interval={interval}
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
          position={this.state.line.position}
          selected={this.state.lineSelected}
          onClick={onLineClick}
          interval={interval}
          y={60}
          fill={{ left: true, right: false }}
          xScale={xScale} />*/}
      </svg>
    </div>;
  }
}
Demo.childContextTypes = {
  xScale: React.PropTypes.func.isRequired,
  snapValue: React.PropTypes.func.isRequired
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
