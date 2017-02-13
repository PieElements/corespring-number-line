import React from 'react';

export default function Line(props) {
  return <line
    x1={0}
    y1={props.y}
    x2={props.width}
    y2={props.y}
    strokeWidth="2"
    stroke="black" />
}
