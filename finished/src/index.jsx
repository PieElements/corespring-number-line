import './main.css';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { makeStore } from './lib/store';
import Chart from './components/chart.jsx';
import NumberLine from './components/number-line.jsx';
const store = makeStore();

class App extends React.Component {
  constructor(props) {
    console.log('App::')
    super(props);
    this.state = {
      dots: [
        {
          dotPosition: 2,
          selected: false
        }
      ]
    }
  }

  onMoveDot(d, newValue) {
    console.log('d', d, 'newValue: ', newValue);
    d.dotPosition = newValue;
    this.setState({ dots: this.state.dots }, () => {
      console.log('DOTS', JSON.stringify(this.state.dots));
    });
  }

  toggleDot(d) {
    d.selected = !d.selected;
    this.setState({ dots: this.state.dots });
  }

  onAddDot(position) {
    this.state.dots.push({ dotPosition: position, selected: false });
    this.setState({ dots: this.state.dots });
  }

  deleteSelected() {
    let dots = this.state.dots.filter(d => !d.selected);
    this.setState({ dots: dots });
  }

  selectAll() {
    let dots = this.state.dots.map(d => {
      d.selected = true;
      return d;
    });
    this.setState({ dots: dots });
  }

  render() {
    return <div>
      <button onClick={this.deleteSelected.bind(this)}>delete</button>
      <button onClick={this.selectAll.bind(this)}>select all</button>
      <NumberLine width={this.props.width}
        height={this.props.height}
        min={this.props.min}
        max={this.props.max}
        ticks={this.props.ticks}
        toggleDot={this.toggleDot.bind(this)}
        onMoveDot={this.onMoveDot.bind(this)}
        onAddDot={this.onAddDot.bind(this)}
        dots={this.state.dots}
      />
    </div>
  }
}

let props = {
  width: 600,
  height: 400,
  min: -10,
  max: 10,
  ticks: 10
}

const mountingPoint = document.createElement('div');
mountingPoint.className = 'react-app';
document.body.appendChild(mountingPoint);
let nl = React.createElement(App, props);
ReactDOM.render(nl, mountingPoint);
