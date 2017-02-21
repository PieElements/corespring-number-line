import React, { PropTypes as PT } from 'react';
import classNames from 'classnames';

require('./point-chooser.less');

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

function Points(props) {

  let icon = (key, active) => {

    let onClick = active ? () => { } : props.selectPoint.bind(null, key);
    let className = classNames(`element-${key}`, { active });

    return <span
      role="presentation"
      key={key}
      className={className}
      onClick={onClick} >
      <a className={active ? 'active' : ''}>&nbsp;</a>
    </span>
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
  }

  selectType(p) {
    this.props.onElementType(p);
  }

  render() {
    let {
      elementType,
      showDeleteButton,
      onDeleteClick,
      icons } = this.props;

    return <div className="point-chooser">
      <Points
        selected={elementType}
        selectPoint={this.selectType.bind(this)}
        icons={icons} />
      {showDeleteButton &&
        <span className="delete-icon-holder" onClick={onDeleteClick}><DeleteIcon /></span>
      }
    </div>;
  }
}

PointChooser.DEFAULT_TYPE = 'pf';

PointChooser.defaultProps = {
  showDeleteButton: false,
  elementType: PointChooser.DEFAULT_TYPE,
  icons: ['pf', 'pe', 'lff', 'lef', 'lfe', 'lee', 'rfn', 'rfp', 'ren', 'rep']
}

PointChooser.propTypes = {
  elementType: PT.string,
  showDeleteButton: PT.bool,
  onDeleteClick: PT.func.isRequired,
  onElementType: PT.func.isRequired,
  icons: PT.array
}