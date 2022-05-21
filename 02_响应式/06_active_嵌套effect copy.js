let activeEffect;
function effect(fn) {
  const effectFn = () => {
    // 当函数执行的时候，把函数赋值给activeEffect
    activeEffect = effectFn;
    fn();
  };
  // effectFn.deps 哟过来存储，所有与该副作用函数相关联的依赖集合
  effectFn.deps = [];
  effectFn();
}
const bucket = new WeakMap();
function track(target, key) {
  if (!activeEffect) return;
  let depsMap = bucket.get(target);

  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()));
  }
  let deps = depsMap.get(key);
  if (!deps) {
    depsMap.set(key, (deps = new Set()));
  }
  deps.add(activeEffect);
  activeEffect.deps.push(deps); // 存储所有相关的副作用函数
}
function trigger(target, key) {
  const depsMap = bucket.get(target);
  if (!depsMap) return;
  const effects = depsMap.get(key);
  effects &&
    effects.forEach((fn) => {
      fn();
    });
}
const data = {
  foo: true,
  bar: true,
};

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key);
    return target[key];
  },
  set(target, key, newValue) {
    target[key] = newValue;
    trigger(target, key);
  },
});
let temp1, temp2;

effect(function effectFn1() {
  console.log("effectFn1执行了1111111");
  effect(function effectFn2() {
    console.log("effectFn2执行了2222222222");
    temp2 = obj.bar;
  });
  temp1 = obj.foo;
});
obj.bar = "1";
