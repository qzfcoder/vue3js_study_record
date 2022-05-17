function render(obj, root) {
  const el = document.createElement(obj.tag);
  if (typeof obj.children === "string") {
    const text = document.createTextNode(obj.children);
    el.appendChild(text);
  } else {
    obj.children.forEach((child) => {
      render(child, el);
    });
  }
  root.appendChild(el);
}
