/**
 * 防抖
 * 在日常开发中，遇到频繁触发的函数，例如滚动条事件，鼠标滚动事件等，导致某个函数触发过于频繁，造成性能问题
 * 防抖就是指，频繁触发函数，在时间间隔内如果再次触发函数，则重新计时，只有间隔时间不触发函数才执行回调
 */

/**
 * 立即执行版
 * @param {Function} fun 回调函数
 * @param {number} delay 时间间隔 单位毫秒
 */

function debounceImmedIately(fun: Function, delay: number) {
	let timer;
	return function () {
		// 如果存在定时器则清除定时器
		if (timer) clearTimeout(timer);
		// 存在定时器不可执行 不存在可以执行 所以第一次肯定是可以执行的
		let canRun = !timer;
		timer = setTimeout(() => {
			// 给定时器赋值了，时间过后清除，表示可以第二次执行
			timer = null;
		}, delay);
		// 如果可以执行才执行回调函数
		if (canRun) fun.apply(this, arguments);
	};
}

/**
 * 非立即执行版
 * @param {Function} fun 回调函数
 * @param {number} delay 时间间隔 单位毫秒
 * @return {*}
 */
function debounceTimer(fun: Function, delay: number) {
	let timer;
	return function () {
		// 如果存在定时器，则清除后重新计时
		if (timer) clearTimeout(timer);
		// 定时器触发回调
		timer = setTimeout(() => {
			fun.apply(this, arguments);
		}, delay);
	};
}

/**
 * 结合版，通过参数觉得是否立即执行
 * @param {Function} fun 回调函数
 * @param {number} delay 时间间隔 单位毫秒
 * @param {boolean} immediately 是否立即执行回调
 */
function debounce(fun: Function, delay: number, immediately: boolean) {
	let timer;
	return function () {
		if (timer) clearTimeout(timer);
		if (immediately) {
			let canRun = !timer;
			timer = setTimeout(() => {
				timer = null;
			}, delay);
			if (canRun) fun.apply(this, arguments);
		} else {
			timer = setTimeout(() => {
				fun.apply(this, arguments);
			}, delay);
		}
	};
}

export { debounceImmedIately, debounceTimer, debounce };
