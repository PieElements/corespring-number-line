import Draggable from 'react-draggable';

export default class LocalDraggable extends Draggable {

  componentWillReceiveProps(next) {
    super.componentWillReceiveProps(next);
    //Remove the x/y state as these values have now been updated and will come through as props.
    this.setState({ x: 0, y: 0 });
  }
}

export function getDragPosition(xScale, snapValue, dragX, nodeX) {
  let final = dragX + nodeX;
  let inverted = xScale.invert(final);
  let out = parseFloat(Number(inverted).toFixed(4));
  out = snapValue(out);
  return out;
}
