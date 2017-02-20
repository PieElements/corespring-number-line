import React, { PropTypes as PT } from 'react';
import Draggable, { getDragPosition } from '../../../draggable';
import classNames from 'classnames';

require('./point.less');

export default class Point extends React.Component {

  render() {

    let { onDragStart,
      onDragStop,
      onClick,
      onMove,
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

    let onStop = (e, dd) => {
      if (onDragStop) {
        onDragStop();
      }

      if (dd.deltaX === 0) {
        if (onClick) {
          onClick();
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
      if (this.props.onDrag) {
        this.props.onDrag(p);
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
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onStop}
      axis="x"
      grid={[is]}
      bounds={scaledBounds}>
      {/*fill={empty ? 'white' : 'black'}*/}
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
  onDragStop: PT.func.isRequired,
  onDragStart: PT.func.isRequired,
  bounds: PT.shape({
    left: PT.number.isRequired,
    right: PT.number.isRequired
  }),
  selected: PT.bool,
  disabled: PT.bool,
  correct: PT.bool,
  empty: PT.bool,
  y: PT.number,
  onClick: PT.func.isRequired,
  onMove: PT.func.isRequired
}

Point.contextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
}