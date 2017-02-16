import React from 'react';
import Draggable from 'react-draggable';
import d3 from 'd3';
import _ from 'lodash';

const xScale = (props) => {
  console.log('[xScale] min: ', props.min, 'max: ', props.max, 'width: ', props.width);
  return d3.scale.linear()
    .domain([props.min, props.max])
    .range([40, props.width - 40]);
};

const marshalProps = (props) => {
  const scales = { xScale: xScale(props) };
  return Object.assign({}, props, scales);
};

function Line(props) {
  let y = props.height - 30;

  return <line
    x1={0}
    y1={y}
    x2={props.width}
    y2={y}
    strokeWidth="2"
    stroke="black" />
}

class Tick extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //center align the tick text
    let { width } = this.text.getBBox();
    this.text.setAttribute('x', (width / 2) * -1);
  }

  render() {
    let props = this.props;
    let diff = props.max - props.min;
    let unscaledX = ((diff / props.tickCount) * props.index) + props.min;
    let x = props.xScale(unscaledX);
    let style = {
      userSelect: 'none',
      textAlign: 'center'
    }

    let y = props.height - 30;

    let xText = Number((unscaledX).toFixed(2));

    return <g class="tick"
      opacity="1"
      transform={`translate(${x}, ${y})`}>
      <line stroke="#000" y1="-10" y2="10" x1="0.5" x2="0.5"></line>
      <text ref={text => this.text = text}
        style={style}
        fill="#000"
        y="14"
        width="10"
        dy="0.71em">{xText}</text>
    </g>
  }
}

function LeftArrow(props) {

  //translate(100px, 100px) rotate(180deg)

  let x = props.x || 0;

  let transform = `translate(${x},${props.height - 30})`;

  if (props.rotate) {
    transform += ` rotate(${props.rotate})`
  }

  console.log('transform: ', transform);
  return <path
    d="m 0,0 8.00000003,-5 0,10 -8.00000003,-5"
    transform={transform}
    style={{ fill: '#000000', stroke: '#000000' }} />
}

function RightArrow() {
  return <path
    fill="#000000"
    stroke="#000000"
    d="M528,190L520,185L520,195L528,190"
    style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);"></path>;
}

function Dot(props) {
  // console.log(props);
  if (!props.interval) {
    throw new Error('no interval');
  }
  let scaledInterval = Math.abs(props.xScale(props.min) - props.xScale(props.min + props.interval))
  // console.log('scaledInterval', scaledInterval);
  let data = {
    interval: props.interval,
    position: props.dotPosition,
    bounds: {
      left: props.min - props.dotPosition,
      right: props.max - props.dotPosition
    }
  }

  let minScaled = props.xScale(props.min);
  let maxScaled = props.xScale(props.max);
  let positionScaled = props.xScale(props.dotPosition);
  let leftDistance = minScaled - positionScaled;
  let rightDistance = maxScaled - positionScaled;
  let scaled = {
    interval: scaledInterval,
    position: props.xScale(data.position),
    position: props.xScale(props.dotPosition),
    bounds: {
      left: leftDistance,
      right: rightDistance
    }
  }


  let onStop = (e, dd) => {
    props.onDragStop();

    if (dd.deltaX === 0) {
      props.onClick();
    } else {
      let xScale = props.xScale;
      let newValue = props.xScale.invert(parseInt(dd.node.getAttribute('cx')) + dd.lastX);
      let out = Number(newValue).toFixed(1);
      console.log('[Dot] [onStop]: deltaX', dd.deltaX);
      props.onMoveDot(out);
    }
  }

  let grid = [scaled.interval];
  let y = (props.height - 8) - (props.ySlot * 22);
  return <Draggable
    onStart={props.onDragStart}
    onStop={onStop}
    axis="x"
    grid={grid}
    bounds={scaled.bounds}>
    <circle
      r="7"
      className={props.selected ? 'selected' : ''}
      cx={scaled.position}
      cy={y} />
  </Draggable>;
}

export default class NumberLine extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    let svg = d3.select(this.svg);
    let xScale = marshalProps(this.props).xScale;
    let addDot = this.addDot.bind(this);
    let getState = () => this.state;
    svg.on('click', function () {
      let s = getState();
      if (s && s.isDragging) {
        console.log('is dragging - skip');
      } else {
        var coords = d3.mouse(this);
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

      let ticks = _.times(tickCount + 1, (c) => {
        return <Tick key={c} index={c} tickCount={tickCount} {...d3Props} />
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

        return <Dot
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
          <Line {...d3Props} />
          <LeftArrow height={props.height} />
          <LeftArrow x={props.width}
            rotate={180}
            height={props.height} />
          {ticks}
          {dots}
          <h3>dots</h3>
          {JSON.stringify(this.props.dots, null, '  ')}
          <h3>state</h3>
          {JSON.stringify(this.state, null, ' ')}
        </svg>
      </div>;

    }
  }
}