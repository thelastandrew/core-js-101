/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;
  this.getArea = () => this.width * this.height;
}

/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  return Object.create(proto, Object.getOwnPropertyDescriptors(JSON.parse(json)));
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

class Builder {
  constructor() {
    this.selectors = new Map();
    this.orderRule = ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'];
    this.currentOrder = [];
    this.stringRes = '';
  }

  checkOrder(selector) {
    if (
      this.currentOrder.length > 0
      && this.orderRule.indexOf(selector)
      < this.orderRule.indexOf(this.currentOrder[this.currentOrder.length - 1])
    ) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    if (!this.currentOrder.includes(selector)) this.currentOrder.push(selector);
  }

  checkUniq(selector) {
    if (this.selectors.has(selector)) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
  }

  hasSelectors(selector) {
    if (!this.selectors.has(selector)) this.selectors.set(selector, []);
  }

  setUniqSelector(selector, value) {
    this.checkOrder(selector);
    this.checkUniq(selector);
    this.selectors.set(selector, value);
  }

  setRegSelector(selector, value) {
    this.checkOrder(selector);
    this.hasSelectors(selector);
    this.selectors.get(selector).push(value);
  }

  combine(sel1, sep, sel2) {
    this.stringRes = `${sel1.stringify()} ${sep} ${sel2.stringify()}`;
    return this;
  }

  stringify() {
    this.currentOrder.forEach((sel) => {
      if (Array.isArray(this.selectors.get(sel))) this.selectors.set(sel, this.selectors.get(sel).join(''));
      this.stringRes += this.selectors.get(sel);
    });
    return this.stringRes;
  }

  element(value) {
    this.setUniqSelector('element', value);
    return this;
  }

  id(value) {
    this.setUniqSelector('id', `#${value}`);
    return this;
  }

  class(value) {
    this.setRegSelector('class', `.${value}`);
    return this;
  }

  attr(value) {
    this.setRegSelector('attr', `[${value}]`);
    return this;
  }

  pseudoClass(value) {
    this.setRegSelector('pseudoClass', `:${value}`);
    return this;
  }

  pseudoElement(value) {
    this.setUniqSelector('pseudoElement', `::${value}`);
    return this;
  }
}

const cssSelectorBuilder = {
  element: (value) => new Builder().element(value),
  id: (value) => new Builder().id(value),
  class: (value) => new Builder().class(value),
  attr: (value) => new Builder().attr(value),
  pseudoClass: (value) => new Builder().pseudoClass(value),
  pseudoElement: (value) => new Builder().pseudoElement(value),
  combine: (sel1, sep, sel2) => new Builder().combine(sel1, sep, sel2),
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
