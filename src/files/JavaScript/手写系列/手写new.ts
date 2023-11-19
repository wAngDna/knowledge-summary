/**
 * new的做了什么
 * 创建一个新的空对象
 * 将空对象的原型链接到创建的对象上
 * 改变this指向apply,call等方法，指向创建的新对象
 * 返回原始值忽略，返回对象正常处理
 */

/**
 * @param {*} obj 构造函数，本质就是一个对象
 * @param {array} args 参数列表
 * @return {*} 新对象
 */
function _new(obj, ...args) {
	let newObj = {};
	newObj.__proto__ = obj.prototype;
	const res = obj.call(newObj, ...args);
	return typeof res === "object" ? res : newObj;
}
function Person(name, age) {
	this.name = name;
	this.age = age;
}
let p1 = new Person("wzl", 18);
console.log("p1", p1);
let p2 = _new(Person, "wzl", 20);
console.log("p2", p2);
