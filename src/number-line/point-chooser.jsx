import React, { PropTypes as PT } from 'react';
import concat from 'lodash/concat';


//<path d="M0 0h24v24H0z" fill="none" />
let DeleteIcon = (props) => {
  return <svg
    className="delete-icon"
    fill="#000000"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    <path d="M0 0h24v24H0z" fill="none" />
  </svg>
};

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

  selectType(p) {
    this.props.onElementType(p);
  }

  deselectType(p) {
    //do nothing we always want a type selected
  }

  render() {

    let maybeDeleteIcon = this.props.showDeleteButton ? <span
      onClick={this.props.onDeleteClick} >
      <DeleteIcon />
    </span> : null;

    return <div className="point-chooser">
      <PointFilter
        activeFilter={this.state.activeFilter}
        setFilter={this.setFilter.bind(this)}
        rmFilter={this.rmFilter.bind(this)} />
      <Points
        selected={this.props.elementType}
        selectPoint={this.selectType.bind(this)}
        deselectPoint={this.deselectType.bind(this)}
        icons={this.state.icons} />
      {maybeDeleteIcon}
    </div>;
  }
}

PointChooser.DEFAULT_TYPE = 'pf';

PointChooser.defaultProps = {
  showDeleteButton: false,
  elementType: PointChooser.DEFAULT_TYPE
}

PointChooser.propTypes = {
  elementType: PT.string,
  showDeleteButton: PT.bool,
  onDeleteClick: PT.func.isRequired,
  onElementType: PT.func.isRequired
}