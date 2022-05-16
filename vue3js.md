# vue3js设计与原理(读书记录)

## 1、命令式和声明式

视图层框架通常分为命令式和声明式。

**命令式框架（jq）：**

​	着重于过程，代码本身就是在描述这件事情该如何去处理，去做。

```js
$('#app')
	.text('hello jq')
	.on('click', ()=>{
    	alert('ok')
	})
```

**声明式框架（vue）：**（vue内部实现一定是命令式的，暴露给用户是以声明式的方法）

​	着重于结果，给我们一个模板，我们和vue说我们需要一个点击事件，需要产生什么结果，vue内部来给我们处理。只看结果，我们并不需要知道他内部是则么处理的。

```vue
<div @click="()=>{alert('hello vue')}"> ok </div>
```

**优劣**

**首先，我们可以确定声明式代码一定是劣于命令式代码的性能的。**

​	命令式代码，是可以做到极致的性能优化的，例如你需要更改一个文本内容，你可以通过js直接对文本内容进行修改，而声明式一定是在这个基础上进行操作的，他描述的只是结果，为了获取到他最优的性能，他需要找到前后的差异并且只更新变化的位置，在来渲染。

​	通过这样来看，我们命令式代码来修改代码的性能消耗，假设为A。若是声明式代码，我们通过查找差异部分，假设性能消耗为B，那么声明式代码消耗性能为A+B。

**但是，声明式代码可维护性更强**

​	命令式代码在创建一个目标的时候，我们需要维护整个创建的过程（包括dom元素的创建，更新，删除等等）。而命令式代码，展示的是我们需要的结果，看上去更加直观，需要做什么并不需要我们去关心。我们需要做的是在保持可维护性的同时，将性能消耗降到最低。

**这个时候我们采用了虚拟DOM的方式**，通过虚拟DOM来最小化的找到差异部分。

​	首先，我们得明白，纯js的操作与对dom的操作，两者速度并不是一个量级的，js要不dom操作快的多。

​	虚拟DOM创建页面过程，可以分为2步骤，第一步是创建js对象（就是对真实对象的描述），第二部是遍历这个js对象，将这个js对象树来创建真实的DOM。

​	在使用虚拟DOM更新页面的时候，会增加一个Diff算法，获取到需要更新的页面元素，在性能上也只是算加上了，一个diff的性能消耗，但是这样不会出现数量级差异。这样的话，在使用虚拟DOM更新页面的时候，只会发送更改的元素重新创建更新，不需要全量更新，极大的减少了性能消耗。

​	如果使用innerHTML来更新页面元素的话，innerHTML是将页面重新销毁，在重新来创建页面元素的。 	

**总结：**

​	原生DOM的操作方法，心智负担最大，我们需要手动创建、删除、修改大量的DOM元素，性能最好，可维护性最差

​	通过innerHTML来创建时候，我们是需要凭接字符串也存在一定的心智负担。更新页面的性能根据页面模板大小来计算，越大性能越差

​	虚拟DOM的方式，他是声明式的，心智负担最小，可维护性强，虽然性能比不上对原生DOM的极致操作下的性能，但是在保证心智负担和可维护性前提下是很好的。

## 2、运行和编译

​	纯运行时的框架，他提供一个render函数，用户可以为该函数提供一个树型结构的数据对象，render函数会根据该对象递归的将数据渲染成DOM元素

```js
const obj = {
	tag: 'div', // 标识标签名称
	children [	// 可以是一个数组，来标识子节点， 也可以是一个字符串
		{
			tag: 'span',
			children: 'hello world'
		}
	]
}
```

**实现render函数：**

​	我们给render函数提供了一个树型结构的对象，和一个根节点，通过递归将数据结构渲染到传入的节点上

```js
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

```

​	我们可以引入编译的手段（compiler），将html模板编译成render函数所需要的树型结构，那么分别调用compiler和render函数就可以把页面渲染出来，这就是**运行时+编译**的框架了，他既支持运行时，用户可以直接提供数据对象从而无需编译，有支持编译时候，提供html编译后在交给运行时处理。

​	若是编译器（compiler）直接将模板转成命令式代码，那么render就并不需要了，这就直接变成了一个纯编译的框架了。

## 3、框架部分

#### 1、构建工具\_DEV\_

​	构建工具设置预定义的常量\_DEV\_，能够在生产环境中使框架不包含用于打印报警信息的代码

#### 2、TREE-Shaking

​	Tree-Sharking指的就是消除那些永远不会执行的代码，也就是排除dead code。

​	要想实现Tree-Sharking，则必须满足一个条件，ESM（ES-Modules），Tree-Sharking依赖于ESM的静态结构。

​	我们在编写两个函数a.js和b.js。将b.js导入到main.js中，打包出来，发现不会存在a.js，a.js会被当做dead code删除。

​	若是该函数不会又任何副作用产生等，可以写上/*#_PURE\_#\* /注释，标识该函数不会产生任何的副作用，可以进行Tree-Sharking。

## 4、Vue3的设计思路

### 	1、声明式的描述UI

​	使用模板来声明式的描述ui，事件也存在这对应的描述方式。 

### 	2、渲染器

​	渲染器的作用就是把虚拟DOM渲染为真实DOM。

```js
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

```







