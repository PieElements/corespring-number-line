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

    let getDragPosition = (dd) => {
      let newValue = xScale.invert(parseInt(dd.node.getAttribute('cx')) + dd.lastX);
      return Number(newValue).toFixed(1);
    }

    let onStop = (e, dd) => {
      onDragStop();

      if (dd.deltaX === 0) {
        onClick();
      } else {
        onMoveDot(getDragPosition(dd));
      }
    }

    let onMouseDown = (e) => {
      //prevent the text select icon from rendering.
      e.nativeEvent.preventDefault();
    }

    let is = xScale(interval) - xScale(0);

    let onDrag = (e, dd) => {
      console.log('onDrag', e, dd)
      if (this.props.onDrag) {
        this.props.onDrag(getDragPosition(dd), e, dd);
      }
    }

    return <Draggable
      onMouseDown={onMouseDown}
      onStart={onDragStart}
      onDrag={onDrag}
      onStop={onStop}
      axis="x"
      grid={[is]}
      bounds={{ left: xScale(bounds.left), right: xScale(bounds.right) }}>
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