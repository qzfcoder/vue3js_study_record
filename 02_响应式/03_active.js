// 存储副作用函数的桶
const bucket = new WeakMap();

const obj = new Proxy(data, {
  get(target, key) {
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
    return target[key];
  },
  set(target, key, newValue) {
    target[key] = newValue;
    const depsMap = bucket.get(target);
    if (!depsMap) return;
    const effects = depsMap.get(key);
    effects &&
      effects.forEach((fn) => {
        fn();
      });
  },
});
