/**
 * 节流
 * 在日常开发中，遇到频繁触发的函数，例如滚动条事件，鼠标滚动事件等，导致某个函数触发过于频繁，造成性能问题
 * 节流就是指，频繁触发函数，让函数按照规定时间内只执行一次
 * 节流分为定时器版和时间戳版
 */

/**
 * 定时器版本 不会立即执行函数，而是等第一个间隔时间过了才会执行回调
 * @param {Function} fun 回调函数
 * @param {number} delay 节流间隔时长 单位毫秒
 */
function throttleTimer(fun: Function, delay: number) {
	// 当前是否可以执行函数 默认可以执行
	let canRun = true;
	return function () {
		let args = arguments;
		// 如果当前不能执行函数，说明上一次时间间隔没过，不做处理
		if (!canRun) return;
		// 设为不可执行函数
		canRun = false;
		setTimeout(() => {
			fun.apply(this, args);
			// 定时器结束后执行函数，再次设置为可以执行函数
			canRun = true;
		}, delay);
	};
}

/**
 * 时间戳版本，会立即执行一次回调，然后后续按照时间间隔执行函数
 * @param {Function} fun 回到函数
 * @param {*} delay 间隔时间 单位毫秒
 */
function throttleTimestamp(fun: Function, delay: number) {
	let startTime = 0;
	return function () {
		let args = arguments;
		let nowTime = new Date().getTime();
		if (nowTime - startTime > delay) {
			fun.apply(this, args);
			startTime = nowTime;
		}
	};
}

/**
 * 结合版，会立即执行一次回调，然后后续按照时间间隔执行回调
 * @param {Function} fun 回调函数
 * @param {number} delay 间隔时间 单位毫秒
 */
function throttle(fun: Function, delay: number) {
	let startTime = 0,
		timer;
	return function () {
		let args = arguments;
		const ctx = this;
		let curTime = new Date().getTime();
		if (curTime - startTime > delay) {
			// 如果存在定时器则清除定时器，时间戳与定时器执行冲突
			if (timer) {
				clearTimeout(timer);
				timer = null;
			}
			fun.apply(ctx, args);
			// 更新时间
			startTime = curTime;
		}
		if (!timer) {
			timer = setTimeout(() => {
				fun.apply(ctx, args);
				// 更新时间 防止冲突
				startTime = new Date().getTime();
				clearTimeout(timer);
				timer = null;
			}, delay);
		}
	};
}

export { throttleTimer, throttleTimestamp, throttle };
