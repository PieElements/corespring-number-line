import React from 'react';
import NothingSubmittedIcon from 'corespring-icon/nothing-submitted-icon';

export const NoResponse = (props) => {
  return <div className="no-response" style={{ width: props.width }}>
    <NothingSubmittedIcon
      iconSet="emoji"
      shape="square" />
    <span
      className="message">{props.message}</span>
  </div>;
}