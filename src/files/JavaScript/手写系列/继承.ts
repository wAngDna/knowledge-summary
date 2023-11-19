/**
 * 1. 原型继承
 * 通过将子类的原型对象指向 父类的一个实例，完成继承父类的属性和方法
 * 子类改写从父类继承过来的属性和方会后 会进行覆盖，不会出现篡改的现象
 * 原型继承弊端，多个实例之间 引用类型的操作会出现篡改
 */

function SuperType() {
	this.type = "super";
	this.colors = ["red"];
}

SuperType.prototype.name = "superType";

function SubType() {
	this.type = "sub";
}

// 通过将子类的原型对象指向 父类的一个实例，完成继承父类的属性和方法
SubType.prototype = new SuperType();
let subType = new SubType();

// 子类改写从父类继承过来的属性和方会后 会进行覆盖，不会出现篡改的现象

subType.name = "subType";
let superType = new SuperType();
console.log("subType", subType.type);
console.log("subType", subType.name);
console.log("superType", superType.name);

// 原型继承弊端，多个实例之间 引用类型的操作会出现篡改
let subType1 = new SubType();

// 给subType1 添加 blue
subType1.colors.push("blue");
let subType2 = new SubType();
// 给subType2 添加 yellow
subType2.colors.push("yellow");
console.log("subType1.colors", subType1.colors);
// 发现引用类型的数据被篡改
console.log("subType2.colors", subType2.colors);

/**
 * 2. 借用构造函数继承
 * 使用父类构造函数来增强子类实例，等同于复制父类的实例给子类
 * 弊端就是只能继承父类实例的属性和方法，无法继承父类原型属性和方法
 * 无法实现复用，每个子类都有父类实例函数副本，影响性能
 */
function Person(name: string, age: number) {
	this.name = name;
	this.age = age;
}
Person.prototype.sayHi = function () {
	console.log("hi" + this.name);
};

function My(sex, name, age) {
	this.sex = sex;
	// 调用父类构造函数，调用call apply等方法改变this指向，改到子类this身上
	Person.call(this, name, age);
}
let per1 = new Person("wzl", 18);
per1.sayHi();
let m1 = new My("男", "wzl", 18);
console.log("m1", m1);

/**
 * 3. 组合继承
 * 使用原型链继承原型属性和方法，借用构造函数继承实例属性和方法
 * 缺点：调用了俩次父类构造函数，第一次原型继承时调用，第二次改变this指向时调用
 * 使用子类创建实例对象时，原型上会存在俩份相同的属性和方法
 */
function Student(name?: string, age?: number) {
	this.name = name;
	this.age = age;
}
Student.prototype.sayHi = function () {
	console.log("hi " + this.name);
};
Student.prototype.class = "高一一班";

function User(sex, name, age) {
	this.sex = sex;
	// 调用父类构造函数，增强子类，继承父类原型上的属性和方法
	Student.call(this, name, age);
}
User.prototype = new Student(); //借用构造函数继承父类属性和方法
User.prototype.constructor = User; // 将从constructor指回自己
let u1 = new User("nan", "wzl", 18);
console.log("u1", u1);
u1.sayHi();
User.prototype.sayHi = function () {
	console.log("hi  aaa");
};
u1.sayHi();

/**
 * 寄生组合式继承
 * @param {*} Target 需要继承的对象
 * @param {*} Origin 父类对象
 * @return {*}
 */
function inherit(Target, Origin) {
	// 拿到父类原型
	let prototype = Object(Origin.prototype);
	// 将父类原型指向子类构造函数
	prototype.constructor = Target;
	// 将子类原型 指向父类原型，实现继承
	Target.prototype = prototype;
}

function Father(name, age) {
	this.name = name;
	this.age = age;
}
Father.prototype.sayHello = function () {
	console.log("hello " + this.name);
};
Father.prototype.sex = "男";
function Child(name, age) {
	Father.call(this, name, age);
	this.height = 180;
}
inherit(Child, Father);
let c1 = new Child("f", 30);
console.log("c1", c1);

/**
 * 圣杯模式继承
 * @param {*} Target
 * @param {*} Origin
 * @return {*}
 */
function _inherit(Target, Origin) {
	// 通过中间空对象来继承父元素原型链东西
	const Buffer = function () {};
	Buffer.prototype = Object.create(Origin.prototype);
	// 空对象已经继承完父元素 继承空元素，实现隔离
	Target.prototype = new Buffer();
	// 将构造函数指向本身
	Target.constructor = Target;
	// 小效果，让它永远知道自己继承自谁
	Target.prototype._super = Origin;
}

function P() {
	this.name = "wzl";
}
let p11 = new P();
P.prototype.say = function () {
	console.log(this.name);
};
function S(age) {
	this.age = age;
}
S.prototype.hello = function () {
	console.log(this.age);
};

_inherit(S, P);
let s = new S(19);
console.log("s", s);
