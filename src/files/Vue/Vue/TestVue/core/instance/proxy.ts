import { renderData } from "./render";
// 知道哪个属性被修改了，才能对页面上的内容进行更新
// 所以我们必须先能够捕获这个修改的事件
// 所以需要代理

/**
 * 代理一个普通对象，返回一个包含get set 方法被代理过后的对象
 * @param {any} vm 实例对象 vue
 * @param {any} obj 需要被代理的对象
 * @param {string} namespaced 命名空间
 * @return {Object}  proxyObj 代理过的对象
 */
export function proxyData(vm: any, obj: any, namespaced: string): Object {
	// vm 是vue obj 需要代理的对象
	let proxyObj = null;
	// 如果是数组，单独处理
	if (obj instanceof Array) {
		proxyObj = new Array(obj.length);
		for (let i = 0; i < obj.length; i++) {
			proxyObj[i] = proxyData(vm, obj[i], namespaced);
		}
		proxyObj = proxyArray(vm, obj, namespaced);
	}
	// 如果是普通对象，则递归遍历对象属性，代理每一个属性
	else if (obj instanceof Object) {
		proxyObj = proxyObject(vm, obj, "");
	} else {
		throw new Error("type error");
	}
	return proxyObj;
}

/**
 * 代理一个对象 object, 返回被代理后的对象
 * @param {*} vm 实例对象
 * @param {*} obj 被代理对象
 * @param {*} namespaced 命名空间
 * @return {*}
 */
function proxyObject(vm, obj, namespaced) {
	// 被代理后的对象
	let proxyObj = {};
	// 通过循环遍历对象属性，将每一个值进行代理处理
	for (const key in obj) {
		// 代理对象本身
		Object.defineProperty(proxyObj, key, {
			configurable: true,
			get() {
				return obj[key];
			},
			set: function (value) {
				// 这里需要做别的事情
				obj[key] = value;
				renderData(vm, getNameSpace(namespaced, key));
			},
		});
		// 使用this读取值修改属性也能代理
		Object.defineProperty(vm, key, {
			configurable: true,
			get() {
				return obj[key];
			},
			set(value) {
				obj[key] = value;
				renderData(vm, getNameSpace(namespaced, key));
			},
		});
		// 如果当前值还是一个对象，需要递归代理
		if (obj[key] instanceof Object) {
			proxyObj[key] = proxyObject(vm, obj[key], getNameSpace(namespaced, key));
		}
	}

	return proxyObj;
}

/**
 * 代理数组，修改数组原型方法实现代理
 * @param {*} vm
 * @param {*} arr
 * @param {*} namespaced
 * @return {*}
 */
function proxyArray(vm, arr, namespaced) {
	let obj = {
		eleType: "Array",
		toString: function () {
			let res = "";
			for (let i = 0; i < arr.length; i++) {
				res += arr[i] + ",";
			}
			// 减2是因为后面有空格，逗号
			return res.substring(0, res.length - 2);
		},
		pop() {},
		push() {},
	};
	// 代理哪个方法  就传哪个值
	defArrayFunc.call(vm, obj, "push", namespaced, vm);
	defArrayFunc.call(vm, obj, "pop", namespaced, vm);
	arr.__proto__ = obj;
	return arr;
}
// 保存数组的原型，后面会使用到
let arratPrototype = Array.prototype;
/**
 * 代理数组某个方法
 * @param {*} obj
 * @param {*} funName 代理数组的某个方法 这个参数是方法名称
 * @param {*} namespaced
 * @param {*} vm
 * @return {*}
 */
function defArrayFunc(obj, funName, namespaced, vm) {
	// 这里代理的是方法名，当读取方法名时，会触发value的方法，
	Object.defineProperty(obj, funName, {
		configurable: true,
		enumerable: true,
		value: function (...args) {
			// 实际还是使用的数组原型上的方法
			let orginal = arratPrototype[funName];
			const res = orginal.apply(this, args);
			renderData(vm, getNameSpace(namespaced, null));
			return res;
		},
	});
}
// 获取命名空间
function getNameSpace(nowNameSpace, nowProp) {
	if (nowNameSpace === null) {
		return nowProp;
	} else if (nowProp === null || nowProp === "") {
		return nowNameSpace;
	} else {
		return nowNameSpace + "." + nowProp;
	}
}
