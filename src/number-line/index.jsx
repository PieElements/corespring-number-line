import React from 'react';
import PointChooser from './point-chooser';
import Graph from './graph';
import { getInterval } from './graph/tick-utils';

export default class NumberLine extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      selectedElements: [],
      elementType: PointChooser.DEFAULT_TYPE
    }
  }

  // addDot(d) {

  //   console.log('addDot: ', d, this.state);

  //   // let dots = this.state.dots || [];
  //   // dots.push({ position: d });
  //   // this.setState({ dots: dots });
  // }

  toggleDot(d) {
    if (d) {
      d.selected = !d.selected;
      this.setState({ dots: this.state.dots });
    }
  }

  moveDot(d, position) {
    d.position = position;
    this.setState({});
  }

  deleteSelected() {
    let dots = this.state.dots.filter(d => !d.selected);
    this.setState({ dots: dots });
  }

  elementTypeSelected(t) {
    this.setState({ elementType: t });
  }

  addElement(x) {
    console.log('[addElement] x: ', x);

    let elementData = {
      domainPosition: x,
      type: 'point', //this.state.elementType,
      pointType: 'empty'
    }

    this.props.onAddElement(elementData);
  }

  render() {
    let addElement = this.addElement.bind(this);

    let dotsSelected = false ///*this.state.dots*/[].some(d => d.selected);
    let config = this.props.model.config;
    let { domain: domainArray } = config;
    let domain = {
      min: domainArray[0],
      max: domainArray[1]
    }

    let ticks = {
      major: config.tickFrequency || 2,
      minor: config.snapPerTick || 0,
    }

    let graphProps = {
      domain,
      ticks,
      interval: getInterval(domain, ticks),
      width: 900,
      height: 400
    }

    return <div className="view-number-line">
      <div className="interactive-graph">
        <PointChooser
          elementType={this.state.elementType}
          showDeleteButton={dotsSelected}
          onDeleteClick={this.deleteSelected.bind(this)}
          onElementType={this.elementTypeSelected.bind(this)}
        />
        <hr />
        <Graph
          {...graphProps}
          toggleDot={this.toggleDot.bind(this)}
          elements={this.props.session.answer}
          onAddElement={addElement}
          onMoveDot={this.moveDot.bind(this)}
          debug={true} />
      </div>
    </div>
  }
}