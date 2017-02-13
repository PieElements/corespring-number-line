import React from 'react';
import ReactDOM from 'react-dom';
import NumberLine from './number-line';
import * as d3 from 'd3';

require('./index.less');


export default class CorespringNumberLine extends HTMLElement {

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
    console.log('_render..');
    try {
      if (this._model && this._session) {
        let el = React.createElement(NumberLine, { model: this._model, session: this._session });
        ReactDOM.render(el, this);
      }

    } catch (e) {
      console.log(e.stack);
      console.log('!!', e.message);
    }
  }
}