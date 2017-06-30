import React from 'react';
import TextField from 'material-ui/TextField';

export default class NumberTextField extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value
    };
  }

  componentWillReceiveProps(props) {
    this.setState({
      value: props.value
    });
  }

  _clamp(value) {
    if (this.props.max !== undefined) {
      value = Math.min(value, this.props.max);
    }
    if (this.props.min !== undefined) {
      value = Math.max(value, this.props.min);
    }
    return value;
  }

  onChange(event, value) {
    this.setState({
      value: value
    });
    if (value === '' || isNaN(value)) {
      return;
    }
    let number = this._clamp(parseInt(value, 10));
    this.props.onChange(event, number);
  }

  render() {
    let { value, name, style } = this.props;
    return <TextField 
      name={name} 
      style={style}
      value={this.state.value} 
      onChange={this.onChange.bind(this)} />;
  }

}