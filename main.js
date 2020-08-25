for(let i of [1, 2, 3]) {
  console.log(i);
}


function createElement(tagName, attributes) {
  return document.createElement(tagName);
}


window.a = <div id="test-id" class="test-class">
    <div></div>
    <div></div>
</div>