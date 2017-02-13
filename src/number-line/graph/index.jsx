import React, { PropTypes as PT } from 'react';
import Draggable from 'react-draggable';
import _ from 'lodash';
import { scaleLinear } from 'd3-scale';
import { select, mouse } from 'd3-selection';
import Tick from './tick';
import Point from './elements/point';
import Line from './line';
import Arrow from './arrow';

const xScale = (props) => {
  console.log('[xScale] min: ', props.min, 'max: ', props.max, 'width: ', props.width);
  return scaleLinear()
    .domain([props.min, props.max])
    .range([40, props.width - 40]);
};

const marshalProps = (props) => {
  const scales = { xScale: xScale(props) };
  return Object.assign({}, props, scales);
};

let Debug = (props) => {
  return <div>
    <h3>dots</h3>
    {JSON.stringify(props.dots, null, '  ')}
    <h3>state</h3>
    {JSON.stringify(props.state, null, ' ')}
  </div>;
}

export default class NumberLineGraph extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let svg = select(this.svg);
    let xScale = marshalProps(this.props).xScale;
    let addDot = this.addDot.bind(this);
    let getState = () => this.state;
    svg.on('click', function () {
      let s = getState();
      if (s && s.isDragging) {
        console.log('is dragging - skip');
      } else {
        var coords = mouse(this);
        let x = Math.round(xScale.invert(coords[0]))
        addDot(x);
      }
    });
  }

  addDot(x) {

    let lowerBound = this.props.min;
    let i = this.interval();
    do {
      lowerBound += i;
    } while ((lowerBound + i) < x)

    let upperBound = lowerBound + i;
    let upperDistance = Math.abs(x - upperBound);
    let lowerDistance = Math.abs(x - lowerBound);
    let v = upperDistance > lowerDistance ? lowerBound : upperBound;
    this.props.onAddDot(v);
  }

  interval() {
    const tickCount = this.props.ticks;
    const distance = this.props.max - this.props.min;
    return distance / tickCount;
  }

  render() {

    let props = this.props;
    const d3Props = marshalProps(props);

    if (props.max <= props.min) {
      return <div>{props.max} is less than or equal to {props.min}</div>
    } else {
      const tickCount = props.ticks;
      const distance = props.max - props.min;

      const interval = distance / tickCount;

      let lineY = props.height - 30;

      let ticks = _.times(tickCount + 1, (c) => {
        return <Tick
          key={c}
          value={props.min + (c * interval)}
          y={lineY}
          xScale={d3Props.xScale}
        />
      });

      let onDragStart = () => this.setState({ isDragging: true });
      let onDragStop = () => {
        setTimeout(() => {
          this.setState({ isDragging: false });
        }, 100);
      }

      let onDotClick = (d) => {
        console.log('[NumberLine] onDotClick', d);
        props.toggleDot(d);
      }

      let stacks = [];

      let dots = props.dots.map((d, index) => {
        let position = Number(d.dotPosition).toFixed(2);

        stacks[position] = stacks[position] || [];
        let stack = stacks[position];

        stack.push(d);

        return <Point
          key={index}
          min={props.min}
          max={props.max}
          height={props.height}
          interval={interval}
          ySlot={stack.length}
          dotPosition={position}
          selected={d.selected}
          xScale={d3Props.xScale}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onClick={onDotClick.bind(null, d)}
          onMoveDot={props.onMoveDot.bind(null, d)} />
      });

      let debug = this.props.debug ? <Debug
        dots={this.props.dots || []}
        state={this.state} /> : <span></span>;


      return <div>
        <svg
          ref={svg => this.svg = svg}
          width={props.width}
          height={props.height}
        >
          <style>
            {
              `circle{
              cursor:pointer;
              opacity: 1;
              transition: r 200ms ease-in, opacity 200ms ease-in;
            }

            circle.selected{
              fill: red;
            }
            
            .react-draggable-dragging {
              opacity: 0.2;
              r: 12;
            }

            .react-draggable, .cursor {
              cursor: move;
            }
            .no-cursor {
              cursor: auto;
            }
            svg{
              user-select: none;
            }
            text{
              user-select: none;
              cursor: pointer;
              font-family: sans-serif;
              font-size: 12px;
            }
          `
            }
          </style>
          <Line y={lineY} width={props.width} />
          <Arrow
            y={lineY} />
          <Arrow
            x={props.width}
            y={lineY}
            direction="right"
          />
          {ticks}
          {dots}
          {debug}
        </svg>
      </div>;
    }
  }
}

NumberLineGraph.propTypes = {
  min: PT.number.isRequired,
  max: PT.number.isRequired,
  width: PT.number.isRequired,
  height: PT.number.isRequired,
  ticks: PT.number.isRequired,
  toggleDot: PT.func.isRequired,
  debug: PT.bool
}

NumberLineGraph.defaultProps = {
  debug: false
}