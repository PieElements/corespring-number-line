import React, { PropTypes as PT } from 'react';
import Draggable from '../../../draggable';

export default class Point extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    let { onDragStart,
      onDragStop,
      onClick,
      onMoveDot,
      interval,
      height,
      ySlot,
      selected,
      position,
      min,
      max,
      xScale } = this.props;

    let bounds = {
      left: min - position,
      right: max - position
    }

    let minScaled = xScale(min);
    let maxScaled = xScale(max);
    let positionScaled = xScale(position);

    let boundsScaled = {
      left: minScaled - positionScaled,
      right: maxScaled - positionScaled
    }

    let intervalScaled = Math.abs(xScale(min + interval) - minScaled);

    let onStop = (e, dd) => {
      onDragStop();

      if (dd.deltaX === 0) {
        onClick();
      } else {
        let newValue = xScale.invert(parseInt(dd.node.getAttribute('cx')) + dd.lastX);
        let out = Number(newValue).toFixed(1);
        onMoveDot(out);
      }
    }

    let onMouseDown = (e) => {
      //prevent the text select icon from rendering.
      e.nativeEvent.preventDefault();
    }

    let y = (height - 8) - (ySlot * 22);

    return <Draggable
      onMouseDown={onMouseDown}
      onStart={onDragStart}
      onStop={onStop}
      axis="x"
      grid={[intervalScaled]}
      bounds={boundsScaled}>
      <circle
        r="7"
        className={selected ? 'selected' : ''}
        cx={positionScaled}
        cy={y} />
    </Draggable>;
  }
}


Point.propTypes = {
  interval: PT.number.isRequired,
  min: PT.number.isRequired,
  max: PT.number.isRequired,
  position: PT.number.isRequired,
  onDragStop: PT.func.isRequired,
  onDragStart: PT.func.isRequired,
  onClick: PT.func.isRequired,
  onMoveDot: PT.func.isRequired,
  height: PT.number.isRequired,
  ySlot: PT.number.isRequired,
  xScale: PT.func.isRequired
}