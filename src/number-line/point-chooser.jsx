import React from 'react';
import concat from 'lodash/concat';

function PointFilter(props) {

  let l = (label) => {
    let active = props.activeFilter === label.toLowerCase();
    let key = label.toLowerCase();

    let onClick = active ?
      props.rmFilter.bind(null, key) :
      props.setFilter.bind(null, key);

    return <li
      role="presentation"
      className={active ? 'selected' : ''}
      onClick={onClick}>
      <a>{label}</a>
    </li>;
  }

  return <ul className="point-groupings">
    {l('Point')}
    {l('Line')}
    {l('Ray')}
  </ul>;
}

function Points(props) {

  let icon = (key, active) => {

    let onClick = active ?
      props.deselectPoint.bind(null) :
      props.selectPoint.bind(null, key);

    let className = `element-${key} ${active ? 'active' : ''}`;
    return <span
      role="presentation"
      key={key}
      className={className}
      onClick={onClick}
    ><a className={active ? 'active' : ''}>&nbsp;</a></span>
  }

  let iconTags = props.icons.map(key => {
    let active = key === props.selected;
    return icon(key, active);
  });

  return <div className="element-selector">
    {iconTags}
  </div>;
}


export default class PointChooser extends React.Component {
  constructor(props, context) {
    super(props, context);

    this.point = ['pf', 'pe'];
    this.line = ['lff', 'lef', 'lfe', 'lee'];
    this.ray = ['rfn', 'rfp', 'ren', 'rep'];
    this.allIcons = concat(this.point, this.line, this.ray)
    this.state = {
      activeFilter: null,
      icons: this.allIcons,
      selectedPoint: this.point[0]
    }
  }

  setFilter(p) {
    this.setState({ activeFilter: p, icons: this[p] });
  }

  rmFilter(p) {
    this.setState({ activeFilter: null, icons: this.allIcons });
  }

  selectPoint(p) {
    this.setState({ selectedPoint: p });
  }

  deselectPoint(p) {
    this.setState({ selectedPoint: null });
  }

  render() {
    return <div className="point-chooser">
      <PointFilter
        activeFilter={this.state.activeFilter}
        setFilter={this.setFilter.bind(this)}
        rmFilter={this.rmFilter.bind(this)} />
      <Points
        selected={this.state.selectedPoint}
        selectPoint={this.selectPoint.bind(this)}
        deselectPoint={this.deselectPoint.bind(this)}
        icons={this.state.icons} />
      {this.state.selectedPoint}
    </div>;
  }
}