function render(vnode, container) {
  // 通过传来的vnode中的tag，来创建一个节点
  const el = document.createElement(vnode.tag);
  // props为节点中包含的属性和事件
  for (const key in vnode.props) {
    if (/^on/.test(key)) {
      el.addEventListener(
        key.substr(2).toLowerCase(), // onClick - click
        vnode.props[key] // 传入的事件方法
      );
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
