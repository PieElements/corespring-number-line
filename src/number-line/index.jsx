import React, { PropTypes as PT } from 'react';
import PointChooser from './point-chooser';
import Graph from './graph';
import { getInterval } from './graph/tick-utils';
import cloneDeep from 'lodash/cloneDeep';
import { buildElementModel } from './graph/elements/builder';

export default class NumberLine extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedElements: [],
      elementType: PointChooser.DEFAULT_TYPE
    }
  }

  toggleElement(index, el) {
    let selected = [];
    if (this.state.selectedElements.indexOf(index) === -1) {
      selected = this.state.selectedElements.concat([index]);
    } else {
      selected = this.state.selectedElements.filter(e => e !== index);
    }
    this.setState({ selectedElements: selected });
  }

  moveDot(d, position) {
    d.position = position;
    this.setState({});
  }

  elementTypeSelected(t) {
    this.setState({ elementType: t });
  }

  getDomain() {
    let config = this.props.model.config;
    let { domain: domainArray } = config;
    return {
      min: domainArray[0],
      max: domainArray[1]
    }
  }

  getTicks() {
    let config = this.props.model.config;
    return {
      major: config.tickFrequency || 2,
      minor: config.snapPerTick || 0,
    }
  }

  addElement(x) {
    let domain = this.getDomain();
    let interval = getInterval(domain, this.getTicks());
    let elementData = buildElementModel(x, this.state.elementType, domain, interval);
    if (elementData) {
      this.props.onAddElement(elementData);
    }
  }

  render() {
    let addElement = this.addElement.bind(this);

    let dotsSelected = this.state.selectedElements && this.state.selectedElements.length > 0;
    // let config = this.props.model.config;

    let domain = this.getDomain();

    let ticks = this.getTicks();

    let graphProps = {
      domain,
      ticks,
      interval: getInterval(domain, ticks),
      width: 600,
      height: 400
    }

    let elements = this.props.session.answer.map((e, index) => {
      //clone the object so that we can add properties to it internally
      let out = cloneDeep(e);
      out.selected = this.state.selectedElements.indexOf(index) !== -1;
      return out;
    });

    let deleteElements = () => {
      this.props.onDeleteElements(this.state.selectedElements);
      this.setState({ selectedElements: [] });
    }

    return <div className="view-number-line">
      <div className="interactive-graph">
        <PointChooser
          elementType={this.state.elementType}
          showDeleteButton={dotsSelected}
          onDeleteClick={deleteElements}
          onElementType={this.elementTypeSelected.bind(this)}
        />
        <hr />
        <Graph
          {...graphProps}
          elements={elements}
          onAddElement={addElement}
          onMoveElement={this.props.onMoveElement}
          onToggleElement={this.toggleElement.bind(this)}
          debug={true} />
      </div>
    </div>
  }
}

NumberLine.propTypes = {
  onMoveElement: PT.func.isRequired,
  onDeleteElements: PT.func.isRequired
}