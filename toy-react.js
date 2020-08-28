const RENDER_TO_DOM = Symbol("render to dom");
//this is to generate tag

export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
    this._range = null;
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  appendChild(component) {
    this.children.push(component);
  }

  get vdom() {
    return this.render().vdom;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;
    this._vdom = this.vdom;
    this._vdom[RENDER_TO_DOM](range);
  }
  update() {
    let isSameNode = (oldNode, newNode) => {
      if (oldNode.type !== newNode.type) {
        return false;
      }

      for (let name in newNode.props) {
        if (newNode.props[name] !== oldNode.props[name]) {
          return false;
        }
      }

      if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length) {
        return false;
      }

      if (newNode.type === "#text") {
        if (newNode.content !== oldNode.content) {
          return false;
        }
      }
      return true;
    }

    let update = (oldNode, newNode) => {
      if (!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._ranage);
        return;
      }
      newNode._ranage = oldNode._ranage;

      let newChildren = newNode.vchildren;
      let oldChildren = oldNode.vchildren;

      if (!newChildren || !newChildren.length) {
        return;
      }

      let tailRange = oldChildren[oldChildren.length -1]._ranage;

      for (let i = 0; i < newChildren.length; i++) {
        let newChild = newChildren[i];
        let oldChild = oldChildren[i];
        if (i < oldChildren.length) {
          update(oldChild, newChild);
        } else {
          let range = document.createRange();
          range.setStart(tailRange.endContainer, tailRange.endOffset);
          range.setEnd(tailRange.endContainer, tailRange.endOffset);
          newChild[RENDER_TO_DOM](range);
          tailRange = range;
        }
      }
    }
    let vdom = this.vdom;
    update(this._vdom, vdom);
    this._vdom = vdom;
  }

  setState(newState) {
    if (this.state = null || typeof this.state !== "object") {
      this.state = newState;
      this.rerender();
      return;
    } 

    let merge = (oldState, newState) => {
      for (let p in newState) {
        if (oldState[p] === null || typeof oldState[p] !== "object") {
          oldState[p] = newState[p];
        } else {
          merge(oldState[p], newState[p]);
        }
      }
    }

    merge(this.state, newState);
    this.update();
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type);
    this.type = type;
  }
  
  get vdom() {
    this.vchildren = this.children.map(child => child.vdom);
    return this;
  }

  [RENDER_TO_DOM](range) {
    this._range = range;

    let root = document.createElement(this.type);

    for (let name in this.props) {
      let value = this.props[name];
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

    if (!this.vchildren) {
      this.vchildren = this.children.map(child => child.vdom);
    }

    for (let child of this.children) {
      let childRange = document.createRange();
      childRange.setStart(root, root.childNodes.length);
      childRange.setEnd(root, root.childNodes.length);
      child[RENDER_TO_DOM](childRange);
    }

    replaceContent(range, root);
  }
}




//this is to create content inside tag
class TextWrapper extends Component {
  constructor(content) {
    super(content);
    this.type = "#text";
    this.content = content;
  }
  get vdom() {
    return this;
  }
  [RENDER_TO_DOM](range) {
    this._ranage = range;
    let root = document.createTextNode(this.content);
    replaceContent(range, root);
  }
}


function replaceContent(range, node) {
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()

  range.setStartBefore(node)
  range.setEndAfter(node)
}

export function createElement(type, attributes, ...children) {
  let tag;
  if (typeof type === "string") {
    tag = new ElementWrapper(type);
  } else {
    tag = new type;
  }
  
  for (let attr in attributes) {
    tag.setAttribute(attr, attributes[attr]);
  }
  let insertChildren = (children) => {
    for (let child of children) {
      if (typeof child === "string") {
        child = new TextWrapper(child);
      }
      if (child === null) {
        continue;
      }
      if ((typeof child === "object") && (child instanceof Array)) {
        insertChildren(child);
      } else {
        tag.appendChild(child);
      }
    }
  }
  insertChildren(children);
  return tag;
}

export function render(component, parentElement) {
  let range = document.createRange();
  range.setStart(parentElement, 0);
  range.setEnd(parentElement, parentElement.childNodes.length);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}
