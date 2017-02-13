import React from 'react';
import PointChooser from './point-chooser';
import Graph from './graph';


export default class NumberLine extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      dots: []
    }
  }

  addDot(d) {
    let dots = this.state.dots || [];
    dots.push(d);
    this.setState({ dots: dots });
  }

  toggleDot(d) {
    d.selected = true;
    this.setState({});
  }
  this.moveDot(d, position){
  d.
  }
render() {

  let props = {
    width: 600,
    height: 400,
    min: -10,
    max: 10,
    ticks: 10
  }

  return <div className="view-number-line">
    <div className="interactive-graph">
      <PointChooser />
      <hr />
      <Graph
        {...props}
        toggleDot={() => { }}
        dots={this.state.dots}
        onAddDot={this.addDot.bind(this)}
        onMoveDot={this.moveDot.bind(this)}
        debug={true} />
    </div>
  </div>
}
}