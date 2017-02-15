import React from 'react';
import Point from './point';
import isNumber from 'lodash/isNumber';


export default class Line extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      left: null,
      right: null
    }
  }


  componentWillReceiveProps(nextProps) {
    console.log('nextProps', nextProps);
    if (nextProps) {
      let { position } = nextProps;
      this.setState({ left: position.left, right: position.right });
    }
  }

  onRightDrag(p) {
    console.log('onRightDrag', p);
    this.setState({ right: p });
  }

  onLeftDrag(p) {
    console.log('onLeftDrag', p);
    this.setState({ left: p });
  }

  onMoveLeftDot(d) {
    let { position } = this.props;
    this.props.moveLine({ left: d, right: position.right });
  }

  onMoveRightDot(d) {
    let { position } = this.props;
    this.props.moveLine({ left: position.left, right: d });
  }

  render() {
    let {
      interval,
      fill,
      position,
      domain,
      xScale,
      y
    } = this.props;

    let { onLeftDrag, onRightDrag, onMoveLeftDot, onMoveRightDot } = this;
    console.log('position:', position, this.state);
    let left = isNumber(this.state.left) ? this.state.left : position.left;
    let right = isNumber(this.state.right) ? this.state.right : position.right;

    console.log('left: ', left, 'right: ', right);

    return <g transform={`translate(0, ${y})`}>
      <line x1={xScale(left)} x2={xScale(right)}
        stroke="red"
        strokeWidth="6"
      ></line>
      <Point
        empty={!fill.left}
        interval={interval}
        bounds={{ left: domain.min - position.left, right: domain.max - position.left }}
        position={position.left}
        onDrag={onLeftDrag.bind(this)}
        onMoveDot={onMoveLeftDot.bind(this)}
        xScale={xScale}
      />
      <Point
        empty={!fill.right}
        interval={interval}
        bounds={{ left: domain.min - position.right, right: domain.max - position.right }}
        position={position.right}
        onDrag={onRightDrag.bind(this)}
        onMoveDot={onMoveRightDot.bind(this)}
        xScale={xScale}
      />
    </g>
  }
}