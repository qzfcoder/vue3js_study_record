let activeEffect;
function effect(fn) {
  const effectFn = () => {
    // 当函数执行的时候，把函数赋值给activeEffect
    console.log(effectFn);
    activeEffect = effectFn;
    fn();
  };
  // effectFn.deps 哟过来存储，所有与该副作用函数相关联的依赖集合
  effectFn.deps = [];
  effectFn();
}
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

const obj = {
  ok: true,
  test: "123",
};
effect(() => {
  obj.ok ? obj.test : "";
});
console.log(activeEffect);
