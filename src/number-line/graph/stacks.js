export default function Stack(domain) {

  let elements = [];
  /**
   * Try to add the element to the stack.
   * @return boolean true if added, else false
   */
  this.add = function (el) /*boolean*/ {

    let elementRange = getRange(el);

    if (elementRange.left < domain.min || elementRange.right > domain.max) {
      return false;
    }

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
    let touches = (candidate.left <= elr.left && candidate.right >= elr.right);
    return touches;
  }

  let getRange = (el) => {
    let { type, position } = el;
    if (type.startsWith('p')) {
      return { left: position, right: position }
    } else if (type.startsWith('l')) {
      return position;
    } else if (type.startsWith('r')) {
      let direction = type.charAt(2) === 'p' ? 'positive' : 'negative';
      if (direction === 'positive') {
        return {
          left: position,
          right: domain.max
        }
      } else {
        return {
          left: domain.min,
          right: position
        }
      }
    }
  }
}