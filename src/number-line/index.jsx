import React from 'react';
import PointChooser from './point-chooser';
import Graph from './graph';
import { convertFrequencyToInterval } from './graph/tick-utils';

export default class NumberLine extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      dots: [],
      elementType: PointChooser.DEFAULT_TYPE
    }
  }

  addDot(d) {
    let dots = this.state.dots || [];
    dots.push({ position: d });
    this.setState({ dots: dots });
  }

  toggleDot(d) {
    d.selected = !d.selected;
    this.setState({ dots: this.state.dots });
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

  render() {

    console.log(this.props);

    let props = {
      width: 600,
      height: 400,
      min: -10,
      max: 10,
      ticks: 10
    }

    let dotsSelected = this.state.dots.some(d => d.selected);
    let config = this.props.model.config;
    let { domain: domainArray } = config;
    let domain = {
      min: domainArray[0],
      max: domainArray[1]
    }

    let ticks = convertFrequencyToInterval(domain, config.tickFrequency, config.snapPerTick);

    let graphProps = {
      domain,
      ticks,
      width: 600,
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
          dots={this.state.dots}
          onAddDot={this.addDot.bind(this)}
          onMoveDot={this.moveDot.bind(this)}
          debug={true} />
      </div>
    </div>
  }
}