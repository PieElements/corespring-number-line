import { stub, spy } from 'sinon';
import { expect } from 'chai';

export const assertProp = (getEl, name, expected) => {
  it(`sets ${name} to ${expected}`, () => {
    let el = getEl();
    // console.log('el: ', el.debug());
    expect(el.prop(name)).to.eql(expected)
  });
}

const xScale = spy(function (n) {
  return n;
});
xScale.invert = spy(function (n) {
  return n;
});

export const stubContext = {
  xScale: xScale,
  snapValue: spy(function (n) {
    return n;
  })
}

