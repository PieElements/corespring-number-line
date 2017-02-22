export const lineIsSwitched = (line) => {
  let { position } = line;
  return position.left > position.right;
}

export const switchGraphLine = (line) => {

  let { position } = line;

  if (position.left < position.right) {
    return line;
  }

  let { leftPoint: newRightPoint, rightPoint: newLeftPoint } = line;

  return {
    leftPoint: newLeftPoint,
    rightPoint: newRightPoint,
    position: switchPosition(position),
    type: 'line'
  }
}

export const switchPosition = (p) => {
  let { left: newRight, right: newLeft } = p;
  return { left: newLeft, right: newRight };
}

export const toSessionFormat = (gf) => {
  if (gf.type === 'point') {
    return {
      type: 'point',
      pointType: gf.pointType,
      domainPosition: gf.position
    }
  } else if (gf.type === 'line') {
    return {
      type: 'line',
      size: gf.position.right - gf.position.left,
      domainPosition: gf.position.left,
      leftPoint: gf.leftPoint,
      rightPoint: gf.rightPoint
    }
  } else if (gf.type === 'ray') {
    return {
      type: 'ray',
      domainPosition: gf.position,
      pointType: gf.pointType,
      direction: gf.direction
    }
  }
}

export const toGraphFormat = (sf) => {
  if (sf.type === 'point') {
    return {
      type: 'point',
      pointType: sf.pointType,
      position: sf.domainPosition
    }
  } else if (sf.type === 'line') {
    return {
      type: 'line',
      position: {
        left: sf.domainPosition,
        right: sf.domainPosition + sf.size
      },
      leftPoint: sf.leftPoint,
      rightPoint: sf.rightPoint
    }
  } else if (sf.type === 'ray') {
    return {
      type: 'ray',
      position: sf.domainPosition,
      pointType: sf.pointType,
      direction: sf.direction
    }
  }
}