import React, { PropTypes as PT } from 'react';
import { buildTickModel } from './tick-utils';

require('./ticks.less');

export const TickValidator = PT.shape({
  /** the number of major ticks (including min + max) 
   * to display. cant be lower than 2.
   */
  major: (props, propName) => {
    let major = props[propName];
    if (major < 2) {
      return new Error(`Invalid prop ${propName} < 2. ${componentName}`);
    }
  },
  /** the number of minor ticks to display between major ticks.
   * Can't be less than zero.
   */
  minor: (props, propName, componentName) => {
    let minor = props[propName];
    if (minor < 0) {
      return new Error(`Invalid prop ${propName} must be > 0. ${componentName}`);
    }
    if (minor > 20) {
      return new Error(`Invalid prop ${propName} must be less than or equal to 20. ${componentName}`);
    }
  }
}).isRequired;

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
    let height = major ? 20 : 10;

    return <g className="tick"
      opacity="1"
      transform={`translate(${x}, ${y})`}>
      <line
        y1={(height / 2) * -1}
        y2={height / 2}
        x1="0.5"
        x2="0.5"></line>
      {major &&
        <text ref={text => this.text = text}
          style={style}
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
    let { domain, ticks, interval, y } = this.props;
    let { xScale } = this.context;

    console.log('ticks: for: ', domain, ticks, interval);
    let tickModel = buildTickModel(domain, ticks, interval, xScale);
    let nodes = tickModel.map(({ major, value, x }) => {
      return <Tick
        major={major}
        key={value}
        label={value}
        y={y}
        x={x} />
    });

    return <g>{nodes}</g>;
  }
}

Ticks.contextTypes = {
  xScale: PT.func.isRequired
}

Ticks.propTypes = {
  domain: PT.shape({
    min: PT.number.isRequired,
    max: PT.number.isRequired
  }).isRequired,
  ticks: TickValidator,
  interval: PT.number.isRequired,
  y: PT.number.isRequired
}