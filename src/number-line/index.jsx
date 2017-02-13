import React from 'react';
import PointChooser from './point-chooser';
import Graph from './graph';


export default class NumberLine extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {

    let props = {
      width: 600,
      height: 400,
      min: -10,
      max: 10,
      ticks: 10,
      dots: []
    }

    return <div className="view-number-line">
      <div className="interactive-graph">
        <PointChooser />
        <hr />
        <Graph
          {...props}
          toggleDot={() => { }}
          debug={true} />
      </div>
    </div>
  }
}