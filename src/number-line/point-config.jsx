import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';

require('./point-chooser.less');

class PointConfig extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selection: props.selection
    };
    console.log('props.selection', props.selection);
  }

  toggle(point) {
    this.state.selection[point] = !this.state.selection[point];
    this._stateUpdate();
  }

  toggleAll(value) {
    let display = PointConfig.types.reduce((acc, point) => {
      acc[point] = value;
      return acc;
    }, {});
    this.state.selection = display;
    this._stateUpdate();
  }

  _stateUpdate() {
    this.setState({
      selection: this.state.selection
    }, () => {
      this.props.onSelectionChange(this.state.selection);
    });
  }

  active(point) {
    return this.state.selection[point] === true ? 'active' : '';
  }

  render() {
    return ( 
      <div className="point-config">
        <div className="element-selector">{
          PointConfig.types.map((point, key) => {
            return <span
              role="presentation"
              className={`element-${point.toLowerCase()}`}
              key={point}>
              <a
                className={this.active(point)} 
                onClick={this.toggle.bind(this, point)}>&nbsp;</a>
            </span> 
          })
        }</div>
        <div className="display-toggles">
          <RaisedButton label="Display All" onClick={this.toggleAll.bind(this, true)}/>
          <RaisedButton label="None" onClick={this.toggleAll.bind(this, false)}/>
        </div>
      </div>
    )
  }

}

PointConfig.types = ["PF", "PE", "LFF", "LEF", "LFE", "LEE", "RFN", "RFP", "REN", "REP"];

export default PointConfig;