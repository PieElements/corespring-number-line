export default class CorespringNumberLineConfiguration extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<h1>...test.....</h1>`;
  }

  set model(m) {
    this._model = m;
    console.log('this._modkel: ', this._model);
  }
}