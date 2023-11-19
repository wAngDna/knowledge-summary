import { vmodel } from "../grammer/vmodel";
import VNode from "../vdom/vnode";
import {
	prepareRender,
	getTemplate2VnodeMap,
	getVnode2TemplatewMap,
} from "./render";
/**
 * 暴露出去手动挂载的方法
 * @param {*} Vue 传Vue的实例
 */
export function initMount(Vue) {
	Vue.prototype.$mount = function (el) {
		let vm = this;
		let rootDom = document.getElementById(el);
		mount(vm, rootDom);
	};
}
/**
 * 进行挂载，根据挂载根节点将所有节点转为vnode
 * @param {*} vm vue实例
 * @param {*} elm 真实dom
 */
export function mount(vm, elm) {
	// 进行挂载
	// 将所有节点转为vnode
	vm._vnode = constructVNode(vm, elm, null);
	// 挂载完之后进行预备渲染(建立渲染索引，通过模板找vnode，通过vnode找模板)
	prepareRender(vm, vm._vnode);
}

/**
 *
 * @param {any} vm vue 实例
 * @param {Element} elm 真实dom
 * @param {any} parent 父节点
 * @return {*}
 */
function constructVNode(vm: any, elm: Element, parent: any) {
	// 判断元素是否包含v-model属性
	analysisAttr(vm, elm, parent);
	// 根据真实dom 实例化VNode
	let vnode = null;
	let children = [];
	let text = getNodeText(elm);
	let data = null;
	let nodeType = elm.nodeType;
	let tag = elm.nodeName;
	vnode = new VNode(tag, elm, children, text, data, parent, nodeType);
	// 获取真实DOM下是否有子节点 elm是真实dom，childNodes就是真实dom下的所有子节点
	let childs = vnode.elm.childNodes;
	// 遍历子节点，进行深度优先搜索，将所有节点转换为vnode
	for (let i = 0; i < childs.length; i++) {
		let childNodes: any = constructVNode(vm, childs[i], vnode);
		// 如果返回的节点是VNode类型 说明下面已经没有子节点了
		if (childNodes instanceof VNode) {
			// 返回单一节点
			vnode.children.push(childNodes);
		} else {
			// 返回节点数组 将返回的子节点与之前子节点合并
			vnode.children = vnode.children.concat(childNodes);
		}
	}
	return vnode;
}

/**
 * 获取文本子节点的文本内容
 * @param {Element} elm
 */
function getNodeText(elm: Element): string {
	// 节点type 等于3 是文本节点返回内容
	if (elm.nodeType === 3) {
		return elm.nodeValue;
	}
	return "";
}

/**
 * 检查元素的属性，是否包含v-model，如果是的话，给元素绑定onchange事件，让其双向绑定
 * @param {*} vm
 * @param {*} elm
 * @param {*} parent
 * @return {*}
 */
function analysisAttr(vm, elm, parent) {
	// 只有是标签才会有属性
	if (elm.nodeType === 1) {
		// 获取元素所有属性
		let attrNames = elm.getAttributeNames();
		if (attrNames.indexOf("v-model") > -1) {
			// 包含v-model属性就需要进行双向绑定操作
			vmodel(vm, elm, elm.getAttribute("v-model"));
		}
	}
}
