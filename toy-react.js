export function createElement(type, attributes, ...children) {
  let tag;
  if (typeof type === "string") {
    tag = document.createElement(type);
  } else {
    tag = new type;
  }
  
  for (let attr in attributes) {
    tag.setAttribute(attr, attributes[attr]);
  }
  for (let child of children) {
    if (typeof child === "string") {
      child = document.createTextNode(child);
    }
    tag.appendChild(child);
  }
  return tag;
}
