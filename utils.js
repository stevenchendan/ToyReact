
export const RENDER_TO_DOM = Symbol('render to dom')

export function replaceContent (range, node) {
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()

  range.setStartBefore(node)
  range.setEndAfter(node)
}

export function getRange (
  startNode,
  startOffset,
  endNode,
  endOffset,
  deleteContents = false
) {
  const range = document.createRange()
  range.setStart(startNode, startOffset)
  range.setEnd(endNode, endOffset)
  if (deleteContents) range.deleteContents()
  return range
}

export function isSameNode (oldNode, newNode) {
  if (oldNode.type !== newNode.type) {
    return false
  }

  for (let name in newNode.props) {
    if (newNode.props[name] !== oldNode.props[name]) {
      return false
    }
  }
  if (Object.keys(oldNode.props).length > Object.keys(newNode.props).length)
    return false

  if (newNode.type == '#text') {
    if (newNode.content !== oldNode.content) return false
  }

  return true
}

export function updateDom (oldNode, newNode) {
  if (!isSameNode(oldNode, newNode))
    return newNode[RENDER_TO_DOM](oldNode._range)

  newNode._range = oldNode._range
  const newChildren = newNode.vchildren
  const oldChildren = oldNode.vchildren

  if (!newChildren || !newChildren.length) {
    return
  }
  
  let tailRange = oldChildren[oldChildren.length - 1]._range

  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i]
    const oldChild = oldChildren[i]

    if (i < oldChildren.length) {
      updateDom(oldChild, newChild)
    } else {
      const range = getRange(
        tailRange.endContainer,
        tailRange.endOffset,
        tailRange.endContainer,
        tailRange.endOffset
      )
      newChild[RENDER_TO_DOM](range)
      tailRange = range
    }
  }
}

export function merge (oldState, newState) {
  for (let p in newState) {
    if (oldState[p] === null || typeof oldState[p] !== 'object') {
      oldState[p] = newState[p]
    } else {
      merge(oldState[p], newState[p])
    }
  }
}
