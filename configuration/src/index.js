export default class CorespringNumberLineConfiguration extends HTMLElement {
  constructor() {
    super();
    this.innerHTML = `<div>corespring number line config pane</div>`;
  }

  set model(m) {
    this._model = m;
    console.log('this._model: ', this._model);
  }
}