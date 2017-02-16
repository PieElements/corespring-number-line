import React, { PropTypes as PT } from 'react';
import Draggable, { getDragPosition } from '../../../draggable';

require('./point.less');

export default class Point extends React.Component {

  render() {

    let { onDragStart,
      onDragStop,
      onClick,
      onMoveDot,
      interval,
      y,
      bounds,
      selected,
      position,
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
        onMoveDot(newPosition);
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
    
    let className = 'point' + (selected ? ' selected' : '');
    
    return <Draggable
      onMouseDown={onMouseDown}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onStop}
      axis="x"
      grid={[is]}
      bounds={scaledBounds}>
      <circle
        r="5"
        fill={empty ? 'white' : 'black'}
        stroke="black"
        strokeWidth="3"
        className={className}
        cx={xScale(position)}
        cy={y} />
    </Draggable>;
  }
}

Point.defaultProps = {
  y: 0
}

Point.propTypes = {
  interval: PT.number.isRequired,
  position: PT.number.isRequired,
  onDragStop: PT.func.isRequired,
  onDragStart: PT.func.isRequired,
  onClick: PT.func.isRequired,
  onMoveDot: PT.func.isRequired,
  xScale: PT.func.isRequired
}

Point.contextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
}