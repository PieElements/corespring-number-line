import React, { PropTypes as PT } from 'react';
import Draggable from '../../../draggable';
import classNames from 'classnames';

require('./point.less');

export default class Point extends React.Component {

  render() {

    let {
      onDragStop, onDragStart, onDrag: onDragCallback,
      onClick, onMove,
      interval,
      y,
      bounds,
      selected,
      position,
      disabled,
      correct,
      empty } = this.props;

    let { snapValue, xScale } = this.context;

    let dragPosition = (x) => {
      let normalized = x + xScale(0);
      let inverted = xScale.invert(normalized);
      return snapValue(position + inverted);
    }

    let onStart = (e) => {
      this.setState({ startX: e.clientX });
      if (onDragStart) {
        onDragStart();
      }
    }

    let onStop = (e, dd) => {
      if (onDragStop) {
        onDragStop();
      }

      let endX = e.clientX;
      let startX = this.state.startX;
      let deltaX = Math.abs(endX - startX);

      if (deltaX < (is / 10)) {
        if (onClick) {
          onClick();
          this.setState({ startX: null });
        }
      } else {
        let newPosition = dragPosition(dd.lastX);
        onMove(newPosition);
      }
    }

    //prevent the text select icon from rendering.
    let onMouseDown = (e) => e.nativeEvent.preventDefault();

    let is = xScale(interval) - xScale(0);
    let scaledBounds = { left: (bounds.left / interval) * is, right: (bounds.right / interval) * is };

    let onDrag = (e, dd) => {
      let p = dragPosition(dd.x);
      if (onDragCallback) {
        onDragCallback(p);
      }
    }

    let circleClass = classNames('point', {
      selected,
      correct: correct === true,
      incorrect: correct === false,
      empty
    });


    return <Draggable
      disabled={disabled}
      onMouseDown={onMouseDown}
      onStart={onStart}
      onDrag={onDrag}
      onStop={onStop}
      axis="x"
      grid={[is]}
      bounds={scaledBounds}>
      <circle
        r="5"
        strokeWidth="3"
        className={circleClass}
        cx={xScale(position)}
        cy={y} />
    </Draggable>;
  }
}

Point.defaultProps = {
  y: 0,
  selected: false,
  empty: false,
  disabled: false,
  correct: undefined
}

Point.propTypes = {
  interval: PT.number.isRequired,
  position: PT.number.isRequired,
  bounds: PT.shape({
    left: PT.number.isRequired,
    right: PT.number.isRequired
  }),
  selected: PT.bool,
  disabled: PT.bool,
  correct: PT.bool,
  empty: PT.bool,
  y: PT.number,
  onMove: PT.func.isRequired,
  onClick: PT.func,
  onDrag: PT.func,
  onDragStop: PT.func,
  onDragStart: PT.func
}

Point.contextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
}