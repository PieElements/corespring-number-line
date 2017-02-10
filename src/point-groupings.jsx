import React from 'react';

export default class PointGroupings extends React.Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    return <ul className="nav nav-pills">
      <li role="presentation"
      //ng-show="isGroupEnabled(\'Point\')" ng-class="{active: isGroupActive(\'Point\')}" ng-mousedown="selectGroup(\'Point\')"
      ><a>Point</a></li>
      <li role="presentation"
      //ng-show="isGroupEnabled(\'Line\')" ng-class="{active: isGroupActive(\'Line\')}" ng-mousedown="selectGroup(\'Line\')"
      ><a>Line</a></li>
      <li role="presentation"
      //ng-show="isGroupEnabled(\'Ray\')" ng-class="{active: isGroupActive(\'Ray\')}" ng-mousedown="selectGroup(\'Ray\')"
      ><a>Ray</a></li>
    </ul>;
  }
}