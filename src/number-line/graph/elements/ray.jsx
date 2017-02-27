import React, { PropTypes as PT } from 'react';
import Point from './point';
import isNumber from 'lodash/isNumber';
import Draggable from '../../../draggable';
import isEqual from 'lodash/isEqual';
import { basePropTypes } from './base';
import extend from 'lodash/extend';
import Arrow from '../arrow';
import classNames from 'classnames';

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
      selected,
      disabled,
      width,
      correct
    } = this.props;

    let { xScale } = this.context;

    let drag = this.drag.bind(this);
    let stopDrag = this.stopDrag.bind(this);

    let is = xScale(interval) - xScale(0);
    let finalPosition = isNumber(this.state.dragPosition) ? this.state.dragPosition : position;

    let className = classNames('ray', {
      selected,
      correct: correct === true,
      incorrect: correct === false
    });


    let positive = direction === 'positive';
    let left = positive ? finalPosition : domain.min;
    let right = positive ? domain.max : finalPosition;
    let triangleX = positive ? xScale(right) : xScale(left);


    //let the line run all the way to 0 or width.
    let x1 = positive ? xScale(left) : 8;
    let x2 = positive ? (width - 8) : xScale(right);
    let arrowX = positive ? width : 0;
    let arrowDirection = positive ? 'right' : 'left';

    let noop = () => { }

    return <g className={className} transform={`translate(0, ${y})`}>
      <line
        onClick={disabled ? noop : this.props.onToggleSelect}
        className="line-handle"
        x1={x1} x2={x2}
      ></line>
      <Point
        disabled={disabled}
        correct={correct}
        selected={selected}
        empty={empty}
        interval={interval}
        bounds={{ left: domain.min - position, right: domain.max - position }}
        position={position}
        onDrag={drag}
        onDragStop={stopDrag}
        onMove={this.props.onMove}
      />
      <Arrow
        x={arrowX}
        direction={arrowDirection} />
    </g>;
  }
}

Ray.propTypes = extend(basePropTypes(), {
  width: PT.number.isRequired,
  selected: PT.bool,
  disabled: PT.bool,
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
  y: 0,
  disabled: false
}

Ray.contextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
}