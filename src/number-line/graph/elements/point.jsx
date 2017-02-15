import React, { PropTypes as PT } from 'react';
import Draggable from '../../../draggable';

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
      xScale,
      empty } = this.props;

    let getDragPosition = (dd, key) => {
      console.log('[getDragPosition]', dd);
      let x = dd[key];
      let cx = parseInt(dd.node.getAttribute('cx'));
      let newValue = xScale.invert(cx + x);
      return parseFloat(Number(newValue).toFixed(4));
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
        let p = getDragPosition(dd, 'lastX');
        console.log('[onStop] position: ', p);
        onMoveDot(p);
      }
    }

    let onMouseDown = (e) => {
      //prevent the text select icon from rendering.
      e.nativeEvent.preventDefault();
    }

    let is = xScale(interval) - xScale(0);
    let scaledBounds = { left: (bounds.left / interval) * is, right: (bounds.right / interval) * is };

    let onDrag = (e, dd) => {
      let p = getDragPosition(dd, 'x');
      console.log('[onDrag] position: ', p);
      if (this.props.onDrag) {
        this.props.onDrag(p);
      }
    }

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
        strokeWidth="4"
        className={selected ? 'selected' : ''}
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