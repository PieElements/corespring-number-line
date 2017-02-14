import React, { PropTypes as PT } from 'react';
import Draggable from '../../../draggable';

export default class Point extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    let props = this.props;

    let scaledInterval = Math.abs(props.xScale(props.min) - props.xScale(props.min + props.interval))

    let data = {
      interval: props.interval,
      position: props.position,
      bounds: {
        left: props.min - props.position,
        right: props.max - props.position
      }
    }

    let minScaled = props.xScale(props.min);
    let maxScaled = props.xScale(props.max);
    let positionScaled = props.xScale(props.position);
    let leftDistance = minScaled - positionScaled;
    let rightDistance = maxScaled - positionScaled;

    let scaled = {
      interval: scaledInterval,
      position: props.xScale(data.position),
      bounds: {
        left: leftDistance,
        right: rightDistance
      }
    }


    let onStop = (e, dd) => {
      props.onDragStop();

      if (dd.deltaX === 0) {
        props.onClick();
      } else {
        let xScale = props.xScale;
        let newValue = props.xScale.invert(parseInt(dd.node.getAttribute('cx')) + dd.lastX);
        let out = Number(newValue).toFixed(1);
        props.onMoveDot(out);
      }
    }

    let onMouseDown = (e) => {
      //prevent the text select icon from rendering.
      e.nativeEvent.preventDefault();
    }

    let grid = [scaled.interval];
    let y = (props.height - 8) - (props.ySlot * 22);

    return <Draggable
      onMouseDown={onMouseDown}
      onStart={props.onDragStart}
      onStop={onStop}
      axis="x"
      grid={grid}
      bounds={scaled.bounds}>
      <circle
        r="7"
        className={props.selected ? 'selected' : ''}
        cx={scaled.position}
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