import React from 'react';
import ReactDOM from 'react-dom';
import NumberLine from './number-line';
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
    if (s) {
      this._session.answer = this._session.answer || [];
    }
    this._render();
  }

  connectedCallback() {
    this.dispatchEvent(new CustomEvent('pie.register', { bubbles: true }));
    this._render();
  }

  addElement(data) {
    console.log('add element..', this)
    if (!this._session) {
      return;
    }
    this._session.answer = this._session.answer || [];
    this._session.answer.push(data);
    this._render();
  }

  _render() {
    try {
      if (this._model && this._session) {
        let props = {
          model: this._model,
          session: this._session,
          onAddElement: this.addElement.bind(this)
        };
        let el = React.createElement(NumberLine, props)
        ReactDOM.render(el, this);
      }
    } catch (e) {
      console.log(e.stack);
      console.log('!!', e.message);
    }
  }
}