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
      empty } = this.props;

    let { snapValue, xScale } = this.context;

    let getDragPosition = (dd, key) => {
      let x = dd[key];
      let cx = parseInt(dd.node.getAttribute('cx'));
      let final = cx + x;

      let inverted = xScale.invert(final);
      let out = parseFloat(Number(inverted).toFixed(4));
      out = snapValue(out);
      // log('[getDragPosition]', 'out: ', out, 'inverted: ', inverted, 'final: ', final, 'x: ', x, 'cx: ', cx, 'dd: ', dd);
      return out;
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
        onMoveDot(p);
      }
    }

    //prevent the text select icon from rendering.
    let onMouseDown = (e) => e.nativeEvent.preventDefault();

    let is = xScale(interval) - xScale(0);
    let scaledBounds = { left: (bounds.left / interval) * is, right: (bounds.right / interval) * is };

    let onDrag = (e, dd) => {
      let p = getDragPosition(dd, 'x');
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

Point.contextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
}