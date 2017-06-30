import React, { PropTypes as PT } from 'react';
import Draggable from '../../draggable';
import { scaleLinear } from 'd3-scale';
import { select, mouse } from 'd3-selection';
import Point from './elements/point';
import Line from './elements/line';
import Ray from './elements/ray';
import BaseLine from './line';
import Arrow from './arrow';
import Ticks, { TickValidator } from './ticks';
import { getInterval, snapTo } from './tick-utils';
import Stacks from './stacks';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

const getXScale = (min, max, width, padding) => {
  if (min === undefined || max === undefined || width === undefined) {
    throw new Error('missing min/max/width');
  }

  return scaleLinear()
    .domain([min, max])
    .range([padding, width - padding]);
};

export default class NumberLineGraph extends React.Component {

  constructor(props) {
    super(props);
    this.state = {}
  }

  xScaleFn() {
    let { domain, width } = this.props;
    return getXScale(domain.min, domain.max, width, 20);
  }

  snapValueFn() {
    let { domain, interval } = this.props;
    return snapTo.bind(null, domain.min, domain.max, interval);
  }

  getChildContext() {
    return {
      xScale: this.xScaleFn(),
      snapValue: this.snapValueFn()
    };
  }

  /** 
   * Note: we use d3 click + mouse to give us domain values directly.
   * Saves us having to calculate them ourselves from a MouseEvent.
   */
  onRectClick(rect) {
    let { elements, disabled } = this.props;

    if (disabled) {
      return;
    }

    let anyElementSelected = elements.some(e => e.selected);

    if (anyElementSelected) {
      this.props.onDeselectElements();
    } else {
      var coords = mouse(rect._groups[0][0]);
      let x = this.xScaleFn().invert(coords[0]);
      this.addElement(x);
    }
  }

  componentDidMount() {
    let rect = select(this.rect);
    rect.on('click', this.onRectClick.bind(this, rect));
  }

  addElement(x) {
    let snapFn = this.snapValueFn();
    let v = snapFn(x);
    this.props.onAddElement(v);
  }

  render() {

    let {
      domain,
      width,
      ticks,
      height,
      interval,
      onToggleElement,
      onMoveElement,
      disabled } = this.props;

    let { min, max } = domain;

    const xScale = this.xScaleFn();

    if (domain.max <= domain.min) {
      return <div>{domain.max} is less than or equal to {domain.min}</div>
    } else {
      const distance = domain.max - domain.min;
      const lineY = height - 30;

      const stacks = new Stacks(domain);

      let elements = this.props.elements.map((el, index) => {

        let stackIndex = stacks.add(el);

        if (stackIndex === -1) {
          throw new Error('stack index is -1, cant add element');
        }

        let y = lineY - ((stackIndex) * 25);

        let commonProps = {
          key: index,
          y,
          selected: el.selected && !disabled,
          interval,
          disabled,
          correct: el.correct
        }

        let toggleElement = onToggleElement.bind(null, index, el)
        let moveElement = onMoveElement.bind(null, index, el);

        if (el.type === 'line') {
          let empty = { left: el.leftPoint === 'empty', right: el.rightPoint === 'empty' };

          return <Line
            {...commonProps}
            domain={{ min: min, max: max }}
            onMoveLine={moveElement}
            onToggleSelect={toggleElement}
            position={el.position}
            empty={empty} />
        } else if (el.type === 'point') {

          let bounds = {
            left: min - el.position,
            right: max - el.position
          };

          return <Point
            {...commonProps}
            empty={el.pointType === 'empty'}
            position={el.position}
            bounds={bounds}
            onClick={toggleElement}
            onMove={moveElement} />
        } else if (el.type === 'ray') {
          return <Ray
            {...commonProps}
            domain={{ min: min, max: max }}
            direction={el.direction}
            position={el.position}
            onMove={moveElement}
            onToggleSelect={toggleElement}
            width={width}
            empty={el.pointType === 'empty'} />
        }
      });

      return <div>
        <svg
          width={width}
          height={height}>
          <BaseLine y={lineY} width={width} />
          <Arrow
            y={lineY} />
          <Arrow
            x={width}
            y={lineY}
            direction="right" />
          <Ticks
            y={lineY}
            domain={domain}
            ticks={ticks}
            interval={interval} />
          <rect
            ref={rect => this.rect = rect}
            //need to have a fill for it to be clickable
            fill="red"
            fillOpacity="0.0"
            width={width}
            height={height}></rect>
          <ReactCSSTransitionGroup
            transitionName="el"
            component="g"
            transitionAppear={true}
            transitionAppearTimeout={200}
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}>
            {elements}
          </ReactCSSTransitionGroup>
        </svg>
      </div>;
    }
  }
}

NumberLineGraph.childContextTypes = {
  xScale: PT.func.isRequired,
  snapValue: PT.func.isRequired
};

NumberLineGraph.propTypes = {
  domain: PT.shape({
    min: PT.number.isRequired,
    max: PT.number.isRequired
  }).isRequired,
  ticks: TickValidator,
  interval: PT.number.isRequired,
  width: PT.number.isRequired,
  height: PT.number.isRequired,
  onToggleElement: PT.func.isRequired,
  onMoveElement: PT.func.isRequired,
  onAddElement: PT.func.isRequired,
  debug: PT.bool
}

NumberLineGraph.defaultProps = {
  debug: false
}