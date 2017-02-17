export default function Stack(domain) {

  let elements = [];
  /**
   * Try to add the element to the stack.
   * @return boolean true if added, else false
   */
  this.add = function (el) /*boolean*/ {

    let elementRange = getRange(el);

    let touchesExisting = elements.some(e => touchesRange(e, elementRange));

    if (touchesExisting) {
      return false;
    } else {
      elements.push(el);
      return true;
    }
  }

  this.elements = function () {
    return elements;
  };

  let touchesRange = (el, candidate) => {
    let elr = getRange(el);

    // candidate: 1 - - - - 5
    // elr1:        2 - - - - 6
    let touches = (candidate.left <= elr.left && candidate.right >= elr.right);
    return touches;
  }

  let getRange = (el) => {
    if (el.type.startsWith('p')) {
      return { left: el.domainPosition, right: el.domainPosition }
    } else if (el.type.startsWith('l')) {
      return el.position;
    }
  }
}