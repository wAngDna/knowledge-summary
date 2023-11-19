/**
 * Promise有三个状态 挂起 - pending 完成 - fulfilled 失败 - rejected
 * Promise状态一旦发生改变就表示任务已经完成，后续状态就无法修改
 */
const PENDING = "pending";
const FULFILLED = "fulfilled";
const REJECTED = "rejected";

type iState = "pending" | "fulfilled" | "rejected";
type iValue = any;
type iHandlers = any[];

function runMicorTask(callBack: Function) {
	if (process && process.nextTick) {
		process.nextTick(callBack);
	} else if (MutationObserver) {
		const p = document.createElement("p");
		// @ts-ignore
		const ob = new MutationObserver(callBack);
		ob.observe(p, {
			childList: true,
		});
		p.innerHTML = "1";
	} else {
		setTimeout(callBack, 0);
	}
}
/**
 * 判断一个东西是不是一个Promise
 * promiseA+规定，如果一个对象包含then方法，则认为就是promise
 * @param {*} obj
 */
function isPromise(obj) {
	return !!(
		obj &&
		typeof obj === "object" &&
		obj.then &&
		typeof obj.then === "function"
	);
}
class _Promise {
	_value: iValue;
	_state: iState;
	_handlers: iHandlers;
	constructor(executor) {
		this._value = undefined;
		this._state = PENDING;
		this._handlers = [];
		try {
			executor(this._resolve.bind(this), this._reject.bind(this));
		} catch (error) {
			this._reject(error);
		}
	}

	/**
	 * 成功的回调
	 * @param {any} data 成功的数据
	 */
	_resolve(data: any) {
		this._changeState(FULFILLED, data);
	}

	/**
	 * 失败的回调
	 * @param {any} reason 失败的原因
	 */
	_reject(reason: any) {
		this._changeState(REJECTED, reason);
	}

	/**
	 * 改变当前Promise状态
	 * @param {iState} newState 新的状态
	 * @param {any} data 成功的数据/失败的原因
	 */
	_changeState(newState: iState, data: any) {
		// 如果当前的状态不是pending 说明状态已经改变，则不能再进行改变了
		if (this._state !== PENDING) return;
		this._value = data;
		this._state = newState;
		// 每当状态发生改变的时候都需要 运行任务队列中的函数
		this._runHandlers();
	}

	/**
	 * 将一个函数放入任务队列
	 * @param {any} handle 回调函数
	 * @param {iState} state 什么状态执行回调
	 * @param {Function} resolve then方法的成功回调
	 * @param {Function} reject then方法失败回调
	 */
	_pushHandle(handle: any, state: iState, resolve: Function, reject: Function) {
		this._handlers.push({
			handle,
			state,
			resolve,
			reject,
		});
	}

	/**
	 * 执行任务队列中的函数
	 */
	_runHandlers() {
		// 如果是pending说明当前promise还是挂起状态，不做处理
		if (this._state === PENDING) return;
		// 如果当前数组0存在，一直遍历
		while (this._handlers[0]) {
			// 执行第一个回调
			this._runOneHandle(this._handlers[0]);
			// 将执行完的删掉
			this._handlers.shift();
		}
	}

	/**
	 * 处理一个回调函数
	 */
	_runOneHandle({ handle, state, resolve, reject }) {
		// promise 会将回调放入微队列执行
		runMicorTask(() => {
			// 只有当前状态和当前回调状态一样才执行函数
			if (this._state !== state) return;
			// 如果这个回调不是函数 则交给then中的俩个回调处理，状态穿透
			if (typeof handle !== "function") {
				this._state === FULFILLED ? resolve(this._value) : reject(this._value);
				return;
			}
			// 否则正常执行函数
			try {
				// 执行回调拿到结果
				const result = handle(this._value);
				// 如果返回的值又是一个promise，则状态穿透
				if (isPromise(result)) {
					result.then(resolve, reject);
				} else {
					// 否则正常执行
					resolve(result);
				}
			} catch (error) {
				// 出错则直接拒绝
				reject(error);
			}
		});
	}

	/**
	 * then方法，promise核心方法，接受俩个参数
	 * @param {Function} onFulfilled 成功后的回调
	 * @param {Function} onRejected 失败后的回调
	 */
	then(onFulfilled?: Function, onRejected?: Function) {
		// then方法返回的一定是一个Promise
		return new _Promise((resolve, reject) => {
			// 将成功处理函数和失败处理函数都放入任务队列，并且执行任务队列
			this._pushHandle(onFulfilled, FULFILLED, resolve, reject);
			this._pushHandle(onRejected, REJECTED, resolve, reject);
			this._runHandlers();
		});
	}

	/**
	 * 失败处理函数
	 * @param {*} onRejected 失败后的处理回调
	 * @return {*}
	 */
	catch(onRejected) {
		//直接调用then方法，只传一个失败的处理函数
		return this.then(null, onRejected);
	}

	/**
	 * 无论失败还是成功都执行
	 * @param {*} onSettled 执行的回调
	 */
	finally(onSettled) {
		// 为了不论成功还是失败都执行函数，需要给then函数中失败和成功都执行函数，并且不传递参数
		return this.then(
			(data) => {
				onSettled();
				return data;
			},
			(reason) => {
				onSettled();
				return reason;
			}
		);
	}

	/**
	 * 静态方法 - 返回一个已完成的Promise
	 * 特殊情况：
	 * 1.传递的数据本身就是ES6的Promise对象，直接返回Promise
	 * 2.传递的数据是PromiseLike(Promise A+)
	 * @param {*} data
	 */
	static resolve(data) {
		// 如果本身就是promise，则直接返回即可
		if (data instanceof _Promise) {
			return data;
		}
		// 否则返回一个已完成的promise
		return new _Promise((resolve, reject) => {
			if (isPromise(data)) {
				// 如果是promiseLike 则状态穿透
				data.then(resolve, reject);
			} else {
				// 否则直接完成
				resolve(data);
			}
		});
	}

	/**
	 * 得到一个已拒绝的Promise
	 * @param {*} reason
	 */
	static reject(reason) {
		// 返回一个Promise
		return new _Promise((resolve, reject) => {
			// 直接拒绝
			reject(reason);
		});
	}

	/**
	 * 返回一个Promise，该promise的状态有prms决定
	 * proms是一个迭代器，如果迭代器里有一个失败则Promise失败，只有全部成功Promise才成功
	 * @param {iterator} proms
	 */
	static all(proms) {
		return new _Promise((resolve, reject) => {
			try {
				const results = []; // 结果存放的组数
				let fulfilledCount = 0; // 成功的promise数量
				let count = 0; // proms总数
				// 使用for of可以遍历迭代器
				for (const p of proms) {
					// 利用块级遍历保存下标
					let i = count;
					count++;
					// 使用静态方法resolve将迭代器内容包裹一下
					// resolve作用，如果是一个promise则直接返回
					// 其他都会强制转换成promise然后返回，总之都是promise
					_Promise.resolve(p).then((data) => {
						fulfilledCount++;
						results[i] = data;
						// 当已完成的数量和总数一致时，说明都完成了，则all成功
						if (fulfilledCount === count) {
							resolve(results);
						}
					}, reject); // 如果一个失败，则直整个失败
				}
				// 如果count等于0，则直接成功，结果是空数组
				if (count === 0) {
					resolve(results);
				}
			} catch (error) {
				reject(error);
			}
		});
	}

	/**
	 * 返回一个成功的Promise，当迭代器里所有promise都有结果之后
	 * 不论成功失败都返回结果
	 * @param {*} proms
	 */
	static allSettled(proms) {
		// 收集失败以及成功的promise
		const results = [];
		for (const p of proms) {
			results.push(
				_Promise.resolve(p).then(
					(value) => ({
						status: FULFILLED,
						value,
					}),
					(reason) => ({
						status: REJECTED,
						reason,
					})
				)
			);
		}
		// 利用Promise.all 全部执行
		return _Promise.all(results);
	}

	/**
	 * 返回一个promise 返回最快有结果的那个promise,成功的或者失败的
	 * @param {*} proms
	 * @return {*}
	 */
	static race(proms) {
		return new _Promise((resolve, reject) => {
			for (const p of proms) {
				// 最快有结果的将改变 promise状态，后续的则不会执行
				_Promise.resolve(p).then(resolve, reject);
			}
		});
	}
}

function delay(wait: number) {
	return new _Promise((resolve, reject) => {
		setTimeout(() => {
			resolve(111);
		}, wait);
	});
}
async function sleep() {
	console.log("start");
	// @ts-ignore
	const res = await delay(2000);
	console.log("res", res);
	console.log("end");
}
// sleep();
const allP1 = _Promise.resolve(1);
const allP2 = new _Promise((resolve, reject) => {
	setTimeout(() => {
		resolve("all p2");
	}, 1550);
});
const allP3 = _Promise.reject(3);
async function wraperFun() {
	console.log("all start");
	// @ts-ignore
	const res = await _Promise.race([allP1, allP2, allP3, 4]);
	console.log("res", res);
}
wraperFun();
