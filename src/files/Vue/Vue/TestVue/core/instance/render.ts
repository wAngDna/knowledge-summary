import { getValue } from "../utils/ObjectUtil";
// 命名规范  to -> 2  for -> 4

// 通过模板，找到哪些节点用到了这个模板
let template2Vnode = new Map();
// 通过节点，找到这个节点用到了哪些模板
let vnode2Templagte = new Map();

/**
 * 注入render方法，初始化时调用
 * @param {*} Vue
 */
export function renderMinix(Vue) {
	Vue.prototype._render = function () {
		renderNode(this, this._vnode);
	};
}

/**
 * 渲染data中的数据，替换模板中{{}} 为真实data中的数据
 * @param {*} vm
 * @param {*} data
 */
export function renderData(vm, data) {
	// 查找是否当前data在模板map中是否有对应的vnode
	let vnodes = template2Vnode.get(data);
	if (vnodes !== null) {
		for (let i = 0; i < vnodes.length; i++) {
			// 调用方法渲染对应的文本节点
			renderNode(vm, vnodes[i]);
		}
	}
}

/**
 * 渲染文本节点，将模板内容替换成data中真实数据
 * @param {*} vm
 * @param {*} vnode
 */
export function renderNode(vm, vnode) {
	// 只有文本节点才渲染
	if (vnode.nodeType === 3) {
		// 找到当前vnode是否有使用到的模板
		let templates = vnode2Templagte.get(vnode);
		if (templates) {
			// 拿到虚拟节点的文本内容
			let result = vnode.text;
			// 遍历此节点所有用到{{}}的内容
			for (let i = 0; i < templates.length; i++) {
				// 获取当前模板中{{}}中真实的值
				let templateValue = getTemplateValue([vm._data], templates[i]);
				if (templateValue) {
					// 比喻 将 {{ msg }} 替换成 hello
					result = result.replace("{{" + templates[i] + "}}", templateValue);
				}
			}
			// 重新设置真实节点的文本属性
			vnode.elm.nodeValue = result;
		}
	}
	// 判断当前节点是否为input节点
	else if (vnode.nodeType === 1 && vnode.tag === "INPUT") {
		// 获取当前vnode所有对应的模板
		let templates = vnode2Templagte.get(vnode);
		if (templates) {
			for (let i = 0; i < templates.length; i++) {
				// 获取模板中的值
				let templateValue = getTemplateValue(
					[vm._data, vnode.env],
					templates[i]
				);
				if (templateValue) {
					// 修改对应元素的值
					vnode.elm.value = templateValue;
				}
			}
		}
	} else {
		// 如果不是文本节点， 就向下找，
		for (let i = 0; i < vnode.children.length; i++) {
			renderNode(vm, vnode.children[i]);
		}
	}
}
/**
 * 进行渲染之前的操作，建立模板与数据之间的映射关系
 * @param {*} vm
 * @param {*} vnode
 */
export function prepareRender(vm, vnode) {
	if (vnode === null) return;
	// 文本节点
	if (vnode.nodeType === 3) {
		analyysisTemplateString(vnode);
	}
	// 检查元素是否包含v-model 并建立vnode与元素之间的关系
	analysisAttr(vm, vnode);
	// 表示标签节点
	if (vnode.nodeType === 1) {
		// 循环遍历，保证找到所有节点的最深处的文本节点，然后递归调用analyysisTemplateString 匹配模板
		for (let i = 0; i < vnode.children.length; i++) {
			// 递归调用
			prepareRender(vm, vnode.children[i]);
		}
	}
}

/**
 * 找到文本节点包含{{}}的vnode，建立vnode与tamplate联系，template与vnode的联系
 * @param {*} vnode
 */
function analyysisTemplateString(vnode) {
	let templateStringList = vnode.text.match(/{{[a-zA-Z0-9_.]+}}/g);
	for (let i = 0; templateStringList && i < templateStringList.length; i++) {
		// 通过模板找到虚拟节点
		setTemplate2Vnode(templateStringList[i], vnode);
		// 通过虚拟节点找模板
		setVnode2Template(templateStringList[i], vnode);
	}
}

/**
 * 检查元素属性是否包含v-model 如果是的话将元素 建立关联关系
 * @param {*} vm
 * @param {*} vnode
 */
function analysisAttr(vm, vnode) {
	if (vnode.nodeType === 1) {
		let attrNames = vnode.elm.getAttributeNames();
		if (attrNames.indeOf("v-model") > -1) {
			// 建立vnode与template关系
			setTemplate2Vnode(vnode.elm.getAttribute("v-model"), vnode);
			setVnode2Template(vnode.elm.getAttribute("v-model"), vnode);
		}
	}
}

/**
 * 通过找到模板中使用的变量 将变量作为key放入map中 {{msg}}  -> 将msg 作为key，当前vnode作为值放入map中
 * @param {*} template
 * @param {*} vnode
 * @return {*}
 */
function setTemplate2Vnode(template, vnode) {
	// 获取当前模板里面有没有使用某个变量{{ msg }} -> 判断有没有msg
	let templateName = getTemplateName(template);
	// 查到map中有没有当前变量的字符
	let vnodeSet = template2Vnode.get(templateName);
	// 如果有的话添加
	if (vnodeSet) {
		vnodeSet.push(vnode);
	} else {
		// 如果没有的话就给map中设置一个 key是变量的字符, 值是一个数组，因为一个变量的字符不只一处模板用到了
		template2Vnode.set(templateName, [vnode]);
	}
}

/**
 * 通过虚拟节点找到此模板用到了哪些模板，放入map中
 * @param {*} template
 * @param {*} vnode
 */
function setVnode2Template(template, vnode) {
	// 同上
	let templateSet = vnode2Templagte.get(vnode);
	if (templateSet) {
		templateSet.push(getTemplateName(template));
	} else {
		vnode2Templagte.set(vnode, [getTemplateName(template)]);
	}
}

/**
 * 去掉模板字符串里的{{}}
 * @param {string} template
 * @return {string} template
 */
function getTemplateName(template: string): string {
	// 判断template 是否有{{}}， 如果有则去掉，如果没有则之间返回
	// 有{{}}
	if (
		template.substring(0, 2) === "{{" &&
		template.substring(template.length - 2, template.length) == "}}"
	) {
		return template.substring(2, template.length - 2);
	}
	// 没有{{}}
	else {
		return template;
	}
}

/**
 * 获取data中对应模板中变量的值 {{ msg }} == -> 'hello' 获取msg的值
 * @param {*} objs
 * @param {*} templateName
 */
function getTemplateValue(objs, templateName) {
	// 从一堆数据中找到与{{}} 对应的变量
	for (let i = 0; i < objs.length; i++) {
		let temp = getValue(objs[i], templateName);
		if (temp !== null) {
			return temp;
		}
	}
	return null;
}

export function getTemplate2VnodeMap() {
	return template2Vnode;
}

export function getVnode2TemplatewMap() {
	return vnode2Templagte;
}
