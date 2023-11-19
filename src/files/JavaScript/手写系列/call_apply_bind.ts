// 定义函数Function接口
interface Function {
	myCall(context, ...args): void;
	myApply(contet, args): void;
	myBind(context, ...args): void;
}
// 作为测试对象
const testObj = {
	name: "zdream",
	age: 18,
};
// 作为测试函数
function testFun(a, b) {
	return `${this.name}, age ${this.age} args ${a}, ${b}`;
}
/**
 * @param {*} context 调用对象
 * @param {array} args 参数列表
 * @return {*} res 函数执行结果
 */
Function.prototype.myCall = function (context, ...args) {
	// 判断this是否函数，js函数特性，谁调用this指向谁，调用者必须是一个函数
	if (typeof this !== "function") throw new TypeError("not a function");
	// 如果this目标对象没 则默认指向window
	context = context || window;
	// 给目标对象上添加函数，就是调用函数
	context.fn = this;
	// 执行函数并返回结果
	const res = context.fn(...args);
	// 函数对象上挂的函数
	delete context.fn;
	return res;
};
const callRes = testFun.myCall(testObj, 1, 2);
console.log("callRes", callRes);

/**
 * @param {*} context this指向的新对象
 * @param {*} args 参数数组
 * @return {*} res 函数执行结果
 */
Function.prototype.myApply = function (context, args) {
	if (typeof this !== "function") throw new TypeError("not a function");
	context = context || window;
	context.fn = this;
	const res = context.fn(...args);
	delete context.fn;
	return res;
};
const appplyRes = testFun.myApply(testObj, [3, 4]);
console.log("applyRes", appplyRes);

/**
 * @param {*} context this指向目标对象
 * @return {*} Function 返回的函数
 */
Function.prototype.myBind = function (context) {
	if (typeof this !== "function") throw new TypeError("not a function");
	context = context || window;
	// 外部保存一下this
	const _this = this;
	// 拿到参数数组，取第二位以后，第一个由context占了
	let args = Array.prototype.slice.call(arguments, 1);
	// bindFun 当作构造函数使用时，bindFun可以继承当前对象里面的所有属性和方法
	// 用一个构造函数取继承当前对象的所有属性和方法
	let TempFun = function () {};
	const bindFun = function () {
		// 返回的函数调用时，拿到参数数组
		let bindArgs = Array.prototype.slice.call(arguments);
		// 改变返回新函数的this指向为bind指定的this
		// this instanceof bindFun 判断的是，如果返回的新函数当作构造函数来调用的，this就指向实例对象
		// 否则就是当作普通函数使用的 this 指向 指定的对象 或者window
		return _this.apply(
			this instanceof bindFun ? this : context,
			args.concat(bindArgs)
		);
	};
	// 将空对象的原型指向this的原型，继承属性和方法
	TempFun.prototype = this.prototype;
	// 返回的函数原型指向 空对象的属性和方法
	bindFun.prototype = new TempFun();
	return bindFun;
};
const bindRes = testFun.myBind(testObj, 5, 6);
// @ts-ignore
console.log("bindRes", bindRes());
