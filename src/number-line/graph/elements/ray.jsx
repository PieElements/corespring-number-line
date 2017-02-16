import React, { PropTypes as PT } from 'react';
import Point from './point';
import isNumber from 'lodash/isNumber';
import Draggable, { getDragPosition } from '../../../draggable';
import isEqual from 'lodash/isEqual';
import Arrow from '../arrow';

require('./ray.less');

export default class Ray extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      left: null,
      right: null
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      let { position } = nextProps;
      this.setState({ left: position.left, right: position.right });
    }
  }

  onDotDrag(side, p) {
    let { domain } = this.props;
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

  dragPosition(dragX, nodeX) {
    let { xScale, snapValue } = this.context;
    return getDragPosition(xScale, snapValue, dragX, nodeX);
  }

  render() {
    let {
      interval,
      empty,
      fill,
      position,
      direction,
      domain,
      y,
      selected
    } = this.props;

    let { xScale } = this.context;

    let { onDotDrag, onMoveDot } = this;
    let onMoveLeftDot = onMoveDot.bind(this, 'left');
    let onMoveRightDot = onMoveDot.bind(this, 'right');
    let onLeftDrag = onDotDrag.bind(this, 'left');
    let onRightDrag = onDotDrag.bind(this, 'right');

    // let left = isNumber(this.state.left) ? this.state.left : position.left;
    // let right = isNumber(this.state.right) ? this.state.right : position.right;

    let is = xScale(interval) - xScale(0);

    let onMouseDown = (e) => e.nativeEvent.preventDefault();
    let onLineDragStart = (e) => this.setState({ startX: e.clientX });


    let onLineClick = (e) => {
      let { startX, endX } = this.state;
      if (!startX || !endX) {
        return;
      }

      let deltaX = Math.abs(endX - startX);
      if (deltaX < (is / 10)) {
        this.props.onClick();
        this.setState({ startX: null, endX: null });
      }
    }

    let onLineDragStop = (e, dd) => {
      this.setState({ endX: e.clientX });
      let invertedX = xScale.invert(dd.lastX + xScale(0));
      let newPosition = { left: position.left + invertedX, right: position.right + invertedX };

      if (!isEqual(newPosition, this.props.position)) {
        this.props.moveLine(newPosition);
      }
    }

    let scaledLineBounds = {
      left: ((domain.min - position.left) / interval) * is,
      right: ((domain.max - position.right) / interval) * is
    }

    let className = 'ray' + (selected ? ' selected' : '');

    let left = direction === 'positive' ? position : domain.min;
    let right = direction === 'positive' ? domain.max : position;
    let triangleX = direction === 'positive' ? xScale(right) : xScale(left);

    return <g className={className} transform={`translate(0, ${y})`}>
      <line
        onClick={() => { }}
        className="line-handle"
        x1={xScale(left)} x2={xScale(right)}
      ></line>
      <Point
        selected={selected}
        empty={empty}
        interval={interval}
        bounds={{ left: domain.min - position, right: domain.max - position }}
        position={position}
        onDrag={onLeftDrag.bind(this)}
        onMoveDot={onMoveLeftDot.bind(this)}
      />
      <Arrow
        x={triangleX}
        y={0}
        direction={direction === 'positive' ? 'right' : 'left'} />
    </g>;
  }
}


Ray.contextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
}