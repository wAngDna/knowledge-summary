export default class VNode {
	tag: string;
	elm: Element;
	children: any[];
	text: string;
	data: any;
	parent: any;
	nodeType: string;
	env: any;
	instructions: any;
	template: any[];
	constructor(tag, elm, children, text, data, parent, nodeType) {
		this.tag = tag; // 标签类型 DIV SPAN INPUT #TEXT(文本标签) 等等
		this.elm = elm; //对应的真实节点
		this.children = children; // 当前节点下的子节点
		this.text = text; // 当前虚拟节点中的文本内容
		this.data = data; // 预留字段
		this.parent = parent; // 父级节点
		this.nodeType = nodeType; // 节点类型
		this.env = {}; // 当前节点环境变量
		this.instructions = null; // 存放指令
		this.template = []; // 当前节点涉及的模板
	}
}
