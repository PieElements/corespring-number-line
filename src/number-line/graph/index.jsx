import React, { PropTypes as PT } from 'react';
import Draggable from '../../draggable';
import times from 'lodash/times';
import { scaleLinear } from 'd3-scale';
import { select, mouse } from 'd3-selection';
import Point from './elements/point';
import Line from './line';
import Arrow from './arrow';
import Ticks, { TickValidator } from './ticks';
import { getInterval, snapTo } from './tick-utils';

const getXScale = (min, max, width, padding) => {

  if (min === undefined || max === undefined || width === undefined) {
    throw new Error('missing min/max/width');
  }

  return scaleLinear()
    .domain([min, max])
    .range([padding, width - padding]);
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
    this.state = {}
  }

  xScaleFn() {
    let { domain, width } = this.props;
    return getXScale(domain.min, domain.max, width, 20);
  }

  snapValueFn() {
    let { domain, interval } = this.props;
    return snapTo.bind(null, domain.min, domain.max, interval);
  }

  getChildContext() {
    return {
      xScale: this.xScaleFn(),
      snapValue: this.snapValueFn()
    };
  }

  componentDidMount() {
    let svg = select(this.svg);
    let addElement = this.addElement.bind(this);
    let xScale = this.xScaleFn();
    let getState = () => this.state;
    /** 
     * Note: we use d3 click + mouse to give us domain values directly.
     * Saves us having to calculate them ourselves from a MouseEvent.
     */
    svg.on('click', function () {
      let s = getState();
      if (s && !s.isDragging) {
        var coords = mouse(this);
        let x = xScale.invert(coords[0]);
        addElement(x);
      }
    });
  }

  addElement(x) {
    let snapFn = this.snapValueFn();
    let v = snapFn(x);
    this.props.onAddElement(v);
  }

  render() {

    let { domain, width, ticks, height, interval, onToggleElement } = this.props;
    let { min, max } = domain;
    const xScale = this.xScaleFn();

    if (domain.max <= domain.min) {
      return <div>{domain.max} is less than or equal to {domain.min}</div>
    } else {
      const distance = domain.max - domain.min;
      const lineY = height - 30;

      let onDragStart = () => this.setState({ isDragging: true });
      let onDragStop = () => {
        setTimeout(() => {
          this.setState({ isDragging: false });
        }, 100);
      }

      let stacks = [];

      let elements = this.props.elements.map((el, index) => {
        let y = (index + 1) * 20;
        console.log('el: ', el);
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

      /*let dots = this.props.dots.map((d, index) => {
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
          onClick={onToggleElement.bind(null, d)}
          onMoveElement={this.props.onMoveElement.bind(null, d)} />
      });*/

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
            interval={interval}
            xScale={xScale} />
          {elements}
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
  interval: PT.number.isRequired,
  width: PT.number.isRequired,
  height: PT.number.isRequired,
  onToggleElement: PT.func.isRequired,
  onMoveElement: PT.func.isRequired,
  onAddElement: PT.func.isRequired,
  debug: PT.bool
}

NumberLineGraph.defaultProps = {
  debug: false
}