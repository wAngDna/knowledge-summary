import { mount } from "./mount";
import { proxyData } from "./proxy";

let uid = 0;
export function initMinix(Vue) {
	Vue.prototype._init = function (options) {
		const vm = this;
		vm.uid = uid++;
		vm.isVue = true;
		// 初始化Data
		if (options && options.data) {
			// 代理Data
			vm._data = proxyData(vm, options.data, "");
		}
		// 初始化created
		// 初始化methods
		// 初始化 computed
		// 初始化el并挂载
		if (options && options.el) {
			let rootDom = document.getElementById(options.el);
			mount(vm, rootDom);
		}
	};
}
