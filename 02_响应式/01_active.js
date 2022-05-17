// 存储副作用函数的桶
const bucket = new Set();

const data = {
  test: "hello active",
};

const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数存入桶中
    bucket.add(effect);
    return target[key];
  },
  set(target, key, newValue) {
    target[key] = newValue;
    bucket.forEach((fn) => fn());
    return true;
  },
});

function effect() {
  document.body.innerText = obj.test;
}
// 执行副作用函数，通过拦截器将函数存入桶中
effect();

// 1秒后将obj中test文案修改，通过拦截器触发副作用函数，修改页面上的值
setTimeout(() => {
  obj.test = "123";
}, 1000);
