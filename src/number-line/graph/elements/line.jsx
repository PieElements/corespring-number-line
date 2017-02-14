import React from 'react';
import Point from './point';

export default class Line extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      left: null,
      right: null
    }
  }

  onLeftDrag(p, e, dd) {
    console.log('onLeftDrag', e, dd);
    this.setState({ left: p });
  }

  componentWillReceiveProps(nextProps) {
    console.log('>>', nextProps);
    if (nextProps) {

      let { position } = nextProps;
      this.setState({ left: position.left, right: position.right });
    }
  }

  onRightDrag(p, e, dd) {
    console.log('onRightDrag', e, dd);
    this.setState({ right: p });
  }

  render() {
    let {
      interval,
      fill,
      position,
      domain,
      xScale
    } = this.props;

    let { onLeftDrag, onRightDrag } = this;

    return <g transform="translate(0, 50)">
      <Point
        empty={!fill.left}
        interval={interval}
        bounds={{ left: domain.min - position.left, right: domain.max - position.left }}
        position={position.left}
        onDrag={onLeftDrag.bind(this)}
        xScale={xScale}
      />
      <line x1={this.state.left} x2={this.state.right}
        stroke="black"
        strokeWidth="6"
      ></line>
      <Point
        empty={!fill.right}
        interval={interval}
        bounds={{ left: domain.min - position.right, right: domain.max - position.right }}
        position={position.right}
        onDrag={onRightDrag.bind(this)}
        xScale={xScale}
      />
    </g>
  }
}