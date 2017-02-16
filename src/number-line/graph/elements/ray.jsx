import React, { PropTypes as PT } from 'react';
import Point from './point';
import isNumber from 'lodash/isNumber';
import Draggable, { getDragPosition } from '../../../draggable';
import isEqual from 'lodash/isEqual';
import Arrow from '../arrow';
import { basePropTypes } from './base';
import extend from 'lodash/extend';

require('./ray.less');

export default class Ray extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      dragPosition: null
    }
  }

  drag(p) {
    let { domain } = this.props;
    if (p >= domain.min && p <= domain.max) {
      this.setState({ dragPosition: p });
    }
  }

  stopDrag() {
    this.setState({ dragPosition: null });
  }

  render() {
    let {
      interval,
      empty,
      position,
      direction,
      domain,
      y,
      selected
    } = this.props;

    let { xScale } = this.context;

    let drag = this.drag.bind(this);
    let stopDrag = this.stopDrag.bind(this);

    let is = xScale(interval) - xScale(0);
    let finalPosition = isNumber(this.state.dragPosition) ? this.state.dragPosition : position;

    let className = 'ray' + (selected ? ' selected' : '');
    let positive = direction === 'positive';
    let left = positive ? finalPosition : domain.min;
    let right = positive ? domain.max : finalPosition;
    let triangleX = positive ? xScale(right) : xScale(left);

    return <g className={className} transform={`translate(0, ${y})`}>
      <line
        onClick={this.props.onToggleSelect}
        className="line-handle"
        x1={xScale(left)} x2={xScale(right)}
      ></line>
      <Point
        selected={selected}
        empty={empty}
        interval={interval}
        bounds={{ left: domain.min - position, right: domain.max - position }}
        position={position}
        onDrag={drag}
        onDragStop={stopDrag}
        onMoveDot={this.props.onMove}
      />
      <Arrow
        x={triangleX + (positive ? 5 : -5)}
        y={0}
        direction={positive ? 'right' : 'left'} />
    </g>;
  }
}

Ray.propTypes = extend(basePropTypes(), {
  selected: PT.bool,
  empty: PT.bool,
  direction: PT.oneOf(['positive', 'negative']),
  y: PT.number,
  position: PT.number.isRequired,
  onMove: PT.func.isRequired,
  onToggleSelect: PT.func.isRequired
});

Ray.defaultProps = {
  selected: false,
  direction: 'positive',
  y: 0
}

Ray.contextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
}