let activeEffect;
function effect(fn) {
  //用于注册副作用函数
  activeEffect = fn;
  fn();
}
// 存储副作用函数的桶
const bucket = new Set();

const data = {
  test: "hello active",
};

const obj = new Proxy(data, {
  // 拦截读取操作
  get(target, key) {
    // 将副作用函数存入桶中
    // bucket.add(effect);
    if (activeEffect) {
      // 通过判断是否存在activeEffect来进行存储，
      // 这样就不用依赖副作用函数名字，不用局限于副作用函数名字一定要为effect了
      bucket.add(activeEffect);
    }
    return target[key];
  },
  set(target, key, newValue) {
    target[key] = newValue;
    bucket.forEach((fn) => fn());
    return true;
  },
});

// 执行副作用函数，通过拦截器将函数存入桶中
effect(() => {
  console.log(obj.test);
});

// 1秒后将obj中test文案修改，通过拦截器触发副作用函数，修改页面上的值
setTimeout(() => {
  obj.test = "123";
}, 1000);
setTimeout(() => {
  obj.noExit = "234";
}, 2000);
