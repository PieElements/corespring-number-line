import React, { PropTypes as PT } from 'react';
import Draggable from '../../draggable';
import times from 'lodash/times';
import { scaleLinear } from 'd3-scale';
import { select, mouse } from 'd3-selection';
import Point from './elements/point';
import Line from './line';
import Arrow from './arrow';
import Ticks from './ticks';

const getXScale = (min, max, width) => {

  if (min === undefined || max === undefined || width === undefined) {
    throw new Error('missing min/max/width');
  }

  return (v) => {
    let out = scaleLinear()
      .domain([min, max])
      .range([40, width - 40])(v);
    return out;
  }
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
    // let domain = this.props.
    // let xScale = getXScale(this.props.domain.min, this.props.domain.max, this.props.width).xScale;
    // let addDot = this.addDot.bind(this);
    // let getState = () => this.state;
    // /** 
    //  * Note: we use d3 click + mouse to give us domain values directly.
    //  * Saves us having to calculate them ourselves from a MouseEvent.
    //  */
    // svg.on('click', function () {
    //   let s = getState();
    //   if (s && s.isDragging) {
    //     //console.log('is dragging - skip');
    //   } else {
    //     var coords = mouse(this);
    //     let x = Math.round(xScale.invert(coords[0]))
    //     addDot(x);
    //   }
    // });
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

    let { domain, width, ticks, height } = this.props;
    // const d3Props = marshalProps(domain.min, domain.max, props.width);
    const xScale = getXScale(domain.min, domain.max, width);

    if (domain.max <= domain.min) {
      return <div>{domain.max} is less than or equal to {domain.min}</div>
    } else {
      const { interval } = ticks;
      const distance = domain.max - domain.min;

      // const interval = distance / tickCount;

      let lineY = height - 30;

      /*let ticks = times(tickCount + 1, (c) => <Tick
        key={c}
        value={props.min + (c * interval)}
        y={lineY}
        xScale={d3Props.xScale}
      />);*/

      let onDragStart = () => this.setState({ isDragging: true });
      let onDragStop = () => {
        setTimeout(() => {
          this.setState({ isDragging: false });
        }, 100);
      }

      let onDotClick = (d) => props.toggleDot(d);

      let stacks = [];

      /*let dots = props.dots.map((d, index) => {
        let position = Number(d.position);

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
          position={position}
          selected={d.selected}
          xScale={d3Props.xScale}
          onDragStart={onDragStart}
          onDragStop={onDragStop}
          onClick={onDotClick.bind(null, d)}
          onMoveDot={props.onMoveDot.bind(null, d)} />
      });*/
      let dots = [];

      let debug = this.props.debug ? <Debug
        dots={this.props.dots || []}
        state={this.state} /> : <span></span>;

      return <div>
        <svg
          ref={svg => this.svg = svg}
          width={width}
          height={height}
        >
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
  ticks: PT.shape({
    interval: PT.number.isRequired,
    steps: PT.number.isRequired
  }),
  width: PT.number.isRequired,
  height: PT.number.isRequired,
  toggleDot: PT.func.isRequired,
  onMoveDot: PT.func.isRequired,
  debug: PT.bool
}

NumberLineGraph.defaultProps = {
  debug: false
}