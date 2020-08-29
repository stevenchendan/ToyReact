import {
  RENDER_TO_DOM,
  replaceContent,
  getRange,
  updateDom,
  merge,
} from './utils'

export class Component {
  constructor() {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }

  get vdom() {
    return this.render().vdom
  }

  setProps(name, value) {
    this.props[name] = value
  }

  appendChild(component) {
    this.children.push(component)
  }

  [RENDER_TO_DOM](range) {
    this._range = range
    this._vdom = this.vdom
    this._vdom[RENDER_TO_DOM](range)
  }

  update() {
    const vdom = this.vdom
    updateDom(this._vdom, vdom)
    this._vdom = vdom
  }

  setState(newState) {
    if (this.state === null || typeof this.state !== 'object')
      return (this.state = newState)

    merge(this.state, newState)
    this.update()
  }
}

/**
 * Element类
 */
class ElementWrapper extends Component {
  constructor(type) {
    super(type)
    this.type = type
  }

  get vdom() {
    this.vchildren = this.children.map(child => {
      if (child) return child.vdom
    })
    return this
  }

  setAttribute(root) {
    for (let name in this.props) {
      const value = this.props[name]

      if (name.match(/^on([\s\S]+)$/)) {
        root.addEventListener(
          RegExp.$1.replace(/^[\s\S]/, c => c.toLowerCase()),
          value
        )
      } else {
        if (name === 'className') {
          root.setAttribute('class', value)
        } else {
          root.setAttribute(name, value)
        }
      }
    }
  }

  [RENDER_TO_DOM](range) {
    this._range = range
    const root = document.createElement(this.type)
    this.setAttribute(root)

    if (!this.vchildren) this.vchildren = this.children.map(child => child.vdom)
    for (let child of this.vchildren) {
      if (child) {
        child[RENDER_TO_DOM](
          getRange(root, root.childNodes.length, root, root.childNodes.length)
        )
      }
    }
    replaceContent(range, root)
  }
}


//this is to create content inside tag
class TextWrapper extends Component {
  constructor(content) {
    super(content)
    this.type = '#text'
    this.content = content
  }

  get vdom() {
    return this
  }

  [RENDER_TO_DOM](range) {
    this._range = range
    const root = document.createTextNode(this.content)
    replaceContent(range, root)
  }
}

export const createElement = (type, attributes, ...children) => {
  let element
  typeof type === 'string'
    ? (element = new ElementWrapper(type))
    : (element = new type())

  // setProps
  for (let p in attributes) {
    element.setProps(p, attributes[p])
  }

  const insertChildren = children => {
    for (let child of children) {
      // text content
      if (typeof child === 'string') {
        child = new TextWrapper(child)
      }

      // element
      if (typeof child === 'object' && child instanceof Array) {
        insertChildren(child)
      } else {
        element.appendChild(child)
      }
    }
  }
  insertChildren(children)

  return element
}

export function render(component, parentElement) {
  let range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}
