import React, { PropTypes as PT } from 'react';
import Point from './point';
import isNumber from 'lodash/isNumber';
import Draggable, { getDragPosition } from '../../../draggable';
import isEqual from 'lodash/isEqual';
import extend from 'lodash/extend';
import { basePropTypes } from './base';

require('./line.less');

export default class Line extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      left: null,
      right: null
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps) {
      let { position } = nextProps;
      this.setState({ left: position.left, right: position.right });
    }
  }

  onDrag(side, p) {
    let { domain } = this.props;
    if (p >= domain.min && p <= domain.max) {
      let newState = {}
      newState[side] = p;
      this.setState(newState);
    }
  }

  onMove(side, d) {
    let { position: p } = this.props;
    let newPosition = { left: p.left, right: p.right };
    newPosition[side] = d;
    this.props.onMoveLine(newPosition);
  }

  render() {
    let {
      interval,
      empty,
      position,
      domain,
      y,
      selected
    } = this.props;

    let { xScale } = this.context;

    let { onDrag, onMove } = this;
    let onMoveLeft = onMove.bind(this, 'left');
    let onMoveRight = onMove.bind(this, 'right');
    let onDragLeft = onDrag.bind(this, 'left');
    let onDragRight = onDrag.bind(this, 'right');

    let left = isNumber(this.state.left) ? this.state.left : position.left;
    let right = isNumber(this.state.right) ? this.state.right : position.right;

    let is = xScale(interval) - xScale(0);

    let onMouseDown = (e) => e.nativeEvent.preventDefault();
    let onLineDragStart = (e) => this.setState({ startX: e.clientX });

    let onLineClick = (e) => {
      let { startX, endX } = this.state;
      if (!startX || !endX) {
        return;
      }

      let deltaX = Math.abs(endX - startX);
      if (deltaX < (is / 10)) {
        this.props.onToggleSelect();
        this.setState({ startX: null, endX: null });
      }
    }

    let onLineDragStop = (e, dd) => {
      this.setState({ endX: e.clientX });
      let invertedX = xScale.invert(dd.lastX + xScale(0));
      let newPosition = { left: position.left + invertedX, right: position.right + invertedX };

      if (!isEqual(newPosition, this.props.position)) {
        this.props.onMoveLine(newPosition);
      }
    }

    let scaledLineBounds = {
      left: ((domain.min - position.left) / interval) * is,
      right: ((domain.max - position.right) / interval) * is
    }

    let lineClass = 'line' + (selected ? ' selected' : '');

    let onDragStart = this.props.onDragStart.bind(this);
    let onDragStop = this.props.onDragStop.bind(this);

    let common = {
      onDragStart, onDragStop, interval, selected
    }
    return <Draggable
      axis="x"
      handle=".line-handle"
      grid={[is]}
      bounds={scaledLineBounds}
      onStart={onLineDragStart}
      onStop={onLineDragStop}
      onMouseDown={onMouseDown} >
      <g className={lineClass} >
        <g transform={`translate(0, ${y})`}>
          <line
            onClick={onLineClick}
            className="line-handle"
            x1={xScale(left)} x2={xScale(right)}
          ></line>
          <Point
            {...common}
            empty={empty.left}
            bounds={{ left: domain.min - position.left, right: domain.max - position.left }}
            position={position.left}
            onDrag={onDragLeft}
            onMove={onMoveLeft}
          />
          <Point
            {...common}
            empty={empty.right}
            bounds={{ left: domain.min - position.right, right: domain.max - position.right }}
            position={position.right}
            onDrag={onDragRight}
            onMove={onMoveRight}
          />
        </g>
      </g>
    </Draggable>
  }
}

Line.propTypes = extend(basePropTypes(), {
  empty: PT.shape({
    left: PT.bool.isRequired,
    right: PT.bool.isRequired
  }).isRequired,
  position: PT.shape({
    left: PT.number.isRequired,
    right: PT.number.isRequired
  }).isRequired,
  y: PT.number,
  selected: PT.bool,
  onMoveLine: PT.func.isRequired,
  onToggleSelect: PT.func.isRequired,
  onDragStart: PT.func,
  onDragStop: PT.func
});

Line.defaultProps = {
  selected: false,
  y: 0
}

Line.contextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
}