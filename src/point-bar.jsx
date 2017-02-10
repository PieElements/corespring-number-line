import React from 'react';

export default class PointBar extends React.Component {

  constructor(props, context) {
    super(props, context);
  }

  render() {

    let icon = (key, group, active) => {
      return <span
        role="presentation"
        key={key}
        className={`element-${key}`}
      ><a className={active ? 'active' : ''}>&nbsp;</a></span>
    }

    let iconTags = this.props.icons.map(key => {
      return icon(key, key === this.props.activeIcon);
    });

    return <div className="element-selector">
      <span role="presentation" className="element-pf" ><a>&nbsp;</a></span>
      {iconTags}
    </div>;
  }
}

PointBar.defaultProps = {
  icons: ['pf', 'pe', 'lff', 'lef', 'lfe', 'lee', 'rfn', 'rfp', 'ren', 'rep'],
  activeIcon: null
};

PointBar.propTypes = {
  icons: React.PropTypes.array.isRequired,
  activeIcon: React.PropTypes.string
}