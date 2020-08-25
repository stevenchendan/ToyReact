for(let i of [1, 2, 3]) {
  console.log(i);
}


function createElement(tagName, attributes, ...children) {
  let tag = document.createElement(tagName);
  for (let attr in attributes) {
    tag.setAttribute(attr, attributes[attr]);
  }
  for (let child of children) {
    tag.appendChild(child);
  }
  return tag;
}


window.a = <div id="test-id" class="test-class">
    <div></div>
    <div></div>
</div>