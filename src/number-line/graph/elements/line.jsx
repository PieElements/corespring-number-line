import React, { PropTypes as PT } from 'react';
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

  onDotDrag(side, p) {
    let { domain } = this.props;
    console.log('onLeftDrag', p);
    if (p >= domain.min && p <= domain.max) {
      let newState = {}
      newState[side] = p;
      this.setState(newState);
    }
  }

  onMoveLeftDot(d) {
    let { position } = this.props;
    this.props.moveLine({ left: d, right: position.right });
  }

  onMoveDot(side, d) {
    let { position: p } = this.props;
    let newPosition = { left: p.left, right: p.right };
    newPosition[side] = d;
    this.props.moveLine(newPosition);
  }

  render() {
    let {
      interval,
      fill,
      position,
      domain,
      y
    } = this.props;

    let { xScale } = this.context;

    let { onDotDrag, onMoveDot } = this;
    let onMoveLeftDot = onMoveDot.bind(this, 'left');
    let onMoveRightDot = onMoveDot.bind(this, 'right');
    let onLeftDrag = onDotDrag.bind(this, 'left');
    let onRightDrag = onDotDrag.bind(this, 'right');

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
      />
      <Point
        empty={!fill.right}
        interval={interval}
        bounds={{ left: domain.min - position.right, right: domain.max - position.right }}
        position={position.right}
        onDrag={onRightDrag.bind(this)}
        onMoveDot={onMoveRightDot.bind(this)}
      />
    </g>
  }
}


Line.contextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
}