
export function createElement(tagName, attributes, ...children) {
  let tag = document.createElement(tagName);
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


document.body.appendChild(<div id="test-id" class="test-class">
    <div>test</div>
    <div></div>
</div>)