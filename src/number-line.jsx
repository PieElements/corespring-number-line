import React from 'react';
import PointBar from './point-bar';
import PointChooser from './point-chooser';

export default class NumberLine extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {

    return <div className="view-number-line">
      <div className="interactive-graph">
        <PointChooser />
      </div>
    </div>
  }
}