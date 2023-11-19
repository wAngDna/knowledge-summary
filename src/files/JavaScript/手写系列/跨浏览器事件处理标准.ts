const EventUtils = {
	/**
	 * 添加事件绑定
	 * @param {any} element 绑定事件元素
	 * @param {string} type 事件类型
	 * @param {Function} handler 事件处理程序
	 * @param {Boolean} isBubind 是否在冒泡阶段处理
	 */
	addHandler: (
		element: any,
		type: string,
		handler: Function,
		isBubind: boolean = true
	) => {
		if (typeof element.addEventListener === "function") {
			element.addEventListener(type, handler, isBubind);
		} else if (typeof element.attachEvent === "function") {
			element.attchEvent(type, handler);
		} else {
			element[`on${type}`] = handler;
		}
	},
	/**
	 * 移除事件绑定
	 * @param {any} element 绑定事件的元素
	 * @param {string} type 事件类型
	 * @param {Function} handler 事件处理程序
	 */
	removeHandler: (element: any, type: string, handler: Function) => {
		if (element.addEventListener) {
			element.removeEventListener(type, handler);
		} else if (element.attachEvent) {
			element.detachEvent(type, handler);
		} else {
			element[`on${type}`] = null;
		}
	},
	/**
	 * 获取事件对象
	 * @param {any} event 事件对象
	 * @return {Event} 事件对象
	 */
	getEvent: (event: any) => {
		return event ?? window.event;
	},
	/**
	 * 获取事件目标对象
	 * @param {any} event 目标对象
	 * @return {any} 目标对象
	 */
	getTarget: (event: any) => {
		return event.target ?? event.srcElement;
	},
	/**
	 * 阻止事件冒泡
	 * @param {any} event 事件对象
	 */
	stopPropagation: (event: any) => {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = null;
		}
	},
	/**
	 * 阻止默认事件
	 * @param {any} event 事件对象
	 */
	preventDefault: (event: any) => {
		if (event.preventDefault) {
			event.preventDefault();
		} else {
			event.returnValue = false;
		}
	},
};

export default EventUtils;
