import React from 'react';

export default class Tick extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    //center align the tick text
    let { width } = this.text.getBBox();
    this.text.setAttribute('x', (width / 2) * -1);
  }

  render() {
    //the domain value
    let { value, y } = this.props;
    console.log('[Tick] value: ', value, 'y: ', y);
    let x = this.props.xScale(value);

    let style = {
      userSelect: 'none',
      textAlign: 'center'
    }

    let xText = Number((value).toFixed(2));

    return <g className="tick"
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

Tick.propType = {
  value: React.PropTypes.number.isRequired,
  y: React.PropTypes.number.isRequired,
  xScale: React.PropTypes.func.isRequired
}
