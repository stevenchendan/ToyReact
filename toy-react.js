const RENDER_TO_DOM = Symbol("render to dom");
//this is to generate tag
class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(component) {
    let range = document.createRange();
    range.setStart(this.root, this.root.childNodes.length);
    range.setEnd(this.root, this.root.childNodes.length);
    component[RENDER_TO_DOM](range);
    this.root.appendChild(component.root);
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents(range);
    range.insertNode(this.root);
  }
}

//this is to create content inside tag
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents(range);
    range.insertNode(this.root);
  }
}


export class Component {
  constructor() {
    this.props = Object.create(null);
    this.children = [];
    this._root = null;
  }
  setAttribute(name, value) {
    this.props[name] = value;
  }
  appendChild(component) {
    this.children.push(component);
  }
  [RENDER_TO_DOM](range) {
    this.render()[RENDER_TO_DOM](range);
  }
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
  range.setEnd(parentElement, 0);
  range.deleteContents();
  component[RENDER_TO_DOM](range);
}