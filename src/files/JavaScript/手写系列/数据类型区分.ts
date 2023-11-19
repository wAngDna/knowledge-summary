/**
 * typeo - typeof 能够正确判断基本数据类型中除null之外所有数据类型、
 * null使用typeof判断结果为object
 * typeof无法判断引用数据类型，结果都是object
 */
function _typeOfFun() {
	console.log(typeof 2); // number
	console.log(typeof "2"); // string
	console.log(typeof true); // boolean
	console.log(typeof undefined); // undefined
	console.log(typeof Symbol("1")); // symbol
	console.log(typeof BigInt(11111)); // bigInt
	console.log(typeof {}); // object
	console.log(typeof []); // object
	console.log(typeof null); // object
}

/**
 * instanceof能够检测某个实例对象是否出现在构造函数的prototype中
 * @param {*} left
 * @param {*} right
 */
function _instanceof(left: any, right: any) {
	// 获取对象的原型
	let _proto = Object.getPrototypeOf(left);
	// 构造函数的prototype
	let _prototype = right.prototype;
	while (true) {
		// 如果没有获取到原型，则直接返回false
		if (!_proto) {
			return false;
		}
		// 如果找到了说明存在返回ture
		if (_proto === _prototype) {
			return true;
		}
		// 继续找，原型的原型
		_proto = Object.getPrototypeOf(_proto);
	}
}
// console.log(_instanceof(() => {}, Function)); // true

/**
 * 准确判断数据类型
 * @param {*} origin 源数据
 * @return {String} 数据类型
 */
function getType(origin?: any) {
	// 为什么一定要用Object.prototype.toString方法，
	// 原因是只有Object.prototype.toString方法才是没有被重写过的，
	// 而array等类型上的toString方法都被改写了
	// 掉用call的原因是，保证toString方法是Object的原型方法，防止查找时出现重名方法，导致类型转换不准确
	// Object.prototype.toString 返回的格式是 [object Type] Type 就是准确的数据类型
	return Object.prototype.toString
		.call(origin)
		.slice(8, -1)
		.toLocaleLowerCase();
}

// const type = getType(1);
// console.log("type", type);
