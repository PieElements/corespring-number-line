import React, { PropTypes as PT } from 'react';
import Draggable from '../../draggable';
import times from 'lodash/times';
import { scaleLinear } from 'd3-scale';
import { select, mouse } from 'd3-selection';
import Point from './elements/point';
import Line from './line';
import Arrow from './arrow';
import Ticks, { TickValidator } from './ticks';
import { snapTo } from './tick-utils';

const getXScale = (min, max, width) => {

  if (min === undefined || max === undefined || width === undefined) {
    throw new Error('missing min/max/width');
  }

  return scaleLinear()
    .domain([min, max])
    .range([40, width - 40]);
};

const getSnapValue = (min, max, interval) => {
  return (v) => snapTo(min, max, interval, value);
}

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

  getChildContext() {
    let { domain, width, ticks } = this.props;
    return {
      xScale: getXScale(domain.min, domain.max, width),
      snapValue: getSnapValue(domain.min, domain.max, ticks.interval)
    };
  }

  componentDidMount() {
    let svg = select(this.svg);
    let addDot = this.addDot.bind(this);
    // let xScale = this.xScale;
    let getState = () => this.state;
    /** 
     * Note: we use d3 click + mouse to give us domain values directly.
     * Saves us having to calculate them ourselves from a MouseEvent.
     */
    svg.on('click', function () {
      let s = getState();
      if (s && s.isDragging) {
        //console.log('is dragging - skip');
      } else {
        var coords = mouse(this);
        let x = Math.round(xScale.invert(coords[0]))
        addDot(x);
      }
    });
  }

  addDot(x) {

    let { ticks, domain } = this.props;
    let i = ticks.interval;
    let lowerBound = domain.min;
    do {
      lowerBound += i;
    } while ((lowerBound + i) < x)

    let upperBound = lowerBound + i;
    let upperDistance = Math.abs(x - upperBound);
    let lowerDistance = Math.abs(x - lowerBound);
    let v = upperDistance > lowerDistance ? lowerBound : upperBound;
    console.log('add dot at: ', v);
    this.props.onAddDot(v);
  }

  render() {

    let { domain, width, ticks, height, toggleDot } = this.props;
    const xScale = getXScale(domain.min, domain.max, width);

    if (domain.max <= domain.min) {
      return <div>{domain.max} is less than or equal to {domain.min}</div>
    } else {
      const { interval } = ticks;
      const distance = domain.max - domain.min;
      const lineY = height - 30;

      let onDragStart = () => this.setState({ isDragging: true });
      let onDragStop = () => {
        setTimeout(() => {
          this.setState({ isDragging: false });
        }, 100);
      }

      let stacks = [];

      let dots = this.props.dots.map((d, index) => {
        let position = Number(d.position);

        stacks[position] = stacks[position] || [];
        let stack = stacks[position];

        stack.push(d);

        return <Point
          key={index}
          min={domain.min}
          max={domain.max}
          height={height}
          interval={interval}
          ySlot={stack.length}
          position={position}
          selected={d.selected}
          xScale={xScale}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onClick={toggleDot.bind(null, d)}
          onMoveDot={this.props.onMoveDot.bind(null, d)} />
      });

      let debug = this.props.debug ? <Debug
        dots={this.props.dots || []}
        state={this.state} /> : <span></span>;

      return <div>
        <svg
          ref={svg => this.svg = svg}
          width={width}
          height={height}>
          <Line y={lineY} width={width} />
          <Arrow
            y={lineY} />
          <Arrow
            x={width}
            y={lineY}
            direction="right"
          />
          <Ticks
            y={lineY}
            domain={domain}
            ticks={ticks}
            xScale={xScale} />
          {dots}
        </svg>
        {debug}
      </div>;
    }
  }
}

NumberLineGraph.childContextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
};
/*

              circle{
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
            */
NumberLineGraph.propTypes = {
  domain: PT.shape({
    min: PT.number.isRequired,
    max: PT.number.isRequired
  }).isRequired,
  ticks: TickValidator,
  width: PT.number.isRequired,
  height: PT.number.isRequired,
  toggleDot: PT.func.isRequired,
  onMoveDot: PT.func.isRequired,
  debug: PT.bool
}

NumberLineGraph.defaultProps = {
  debug: false
}