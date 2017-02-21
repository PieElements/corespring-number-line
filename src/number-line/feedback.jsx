import React from 'react';
import NothingSubmittedIcon from 'corespring-icon/nothing-submitted-icon';
import CorrectIcon from 'corespring-icon/correct-icon';
import PartiallyCorrectIcon from 'corespring-icon/partially-correct-icon';
import ShowRationaleIcon from 'corespring-icon/show-rationale-icon';
import IncorrectIcon from 'corespring-icon/incorrect-icon';
import classNames from 'classnames';

require('./feedback.less');

let getIcon = (t) => {
  switch (t) {
    case 'unanswered': return NothingSubmittedIcon;
    case 'correct': return CorrectIcon;
    case 'incorrect': return IncorrectIcon;
    case 'partial': return PartiallyCorrectIcon;
    case 'info': return ShowRationaleIcon;
    default:
      return undefined;
  }
}

const Feedback = (props) => {

  let className = classNames('feedback', props.type);
  let Icon = getIcon(props.type);

  return <div className={className} style={{ width: props.width }}>
    <Icon iconSet="emoji" shape="square" />
    <span className="message" dangerouslySetInnerHTML={{ __html: props.message }}></span>
  </div>;
}

export default Feedback;
