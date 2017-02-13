import React from 'react';
import ReactDOM from 'react-dom';
import NumberLine from './number-line';
import * as d3 from 'd3';

require('./index.less');

export default class D3Test extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    console.log(d3);
    var x = d3.scaleLinear()
      .domain([-4, 6])
      .range([100, 900]);

    var axis = d3.axisBottom(x);

    d3.select(this)
      .append("svg")
      .attr("width", 1000)
      .attr("height", 300)
      .append("g")
      .call(axis);

  }
}


export class CorespringNumberLine extends HTMLElement {

  constructor() {
    super();
  }

  set model(m) {
    this._model = m;
    this._render();
  }

  set session(s) {
    this._session = s;
    this._render();
  }

  connectedCallback() {
    this.dispatchEvent(new CustomEvent('pie.register', { bubbles: true }));
    this._render();
  }

  _render() {
    console.log('_render..')
    if (this._model && this._session) {
      let el = React.createElement(NumberLine, { model: this._model, session: this._session });
      ReactDOM.render(el, this);
    }
  }
}