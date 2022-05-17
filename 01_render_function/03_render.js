function render(vnode, container) {
  if (typeof vnode.tag === "string") {
    mountElement(vnode, container);
  } else if (typeof vnode.tag === "function") {
    mountComponent(vnode, container);
  }
}

function mountElement(vnode, container) {
  const el = document.createElement(vnode.tag);
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      el.addEventListener(key.substr.toLowerCase(), vnode.props[key]);
    }
  }
  if (typeof vnode.children === "string") {
    el.appendChild(document.createTextNode(vnode.children));
  } else if (Array.isArray(vnode.children)) {
    vnode.children.forEach((child) => {
      render(child, el);
    });
  }
  container.appendChild(el);
}

function mountComponent(vnode, container) {
  // 当传入的是组件的时候，tag是一个函数对象，执行获取到真正的虚拟DOM
  const subtree = vnode.tag();
  render(subtree, container);
}
