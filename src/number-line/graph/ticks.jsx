import React, { PropTypes as PT } from 'react';
import { buildTickModel } from './tick-utils';

export class Tick extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //center align the tick text
    if (this.text) {
      let { width } = this.text.getBBox();
      this.text.setAttribute('x', (width / 2) * -1);
    }
  }

  render() {
    //the domain value
    let { label, x, y, major } = this.props;

    let style = {
      userSelect: 'none',
      textAlign: 'center'
    }

    let xText = Number((label).toFixed(2));
    // let color = this.props.major ? 'red' : 'black';
    let height = major ? 20 : 10;

    return <g className="tick"
      opacity="1"
      transform={`translate(${x}, ${y})`}>
      <line
        stroke={'black'}
        y1={(height / 2) * -1}
        y2={height / 2}
        x1="0.5"
        x2="0.5"></line>
      {major &&
        <text ref={text => this.text = text}
          style={style}
          fill="#000"
          y="14"
          width="10"
          dy="0.71em">{xText}</text>

      }
    </g>
  }
}

Tick.propType = {
  label: PT.number.isRequired,
  y: PT.number.isRequired,
  x: PT.number.isRequired,
  major: PT.bool
}

Tick.defaultProps = {
  major: false
}

export default class Ticks extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let { domain, ticks, xScale, y } = this.props;

    console.log('ticks:', ticks);
    let tickModel = buildTickModel(domain, ticks, xScale);

    console.log('tickModel: ', JSON.stringify(tickModel));
    let nodes = tickModel.map(({ major, value, x }) => {
      return <Tick
        major={major}
        key={value}
        label={value}
        y={y}
        x={x}
      />
    });

    return <g>{nodes}</g>;
  }
}

Ticks.propTypes = {
  domain: PT.shape({
    min: PT.number.isRequired,
    max: PT.number.isRequired
  }).isRequired,
  ticks: PT.shape({
    interval: PT.number.isRequired,
    steps: PT.number.isRequired
  }),
  y: PT.number.isRequired,
  xScale: PT.func.isRequired
}