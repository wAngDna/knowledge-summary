/**
 * 逐层找到变量真实对应的值
 * @param {*} obj
 * @param {*} name
 * @return {*}
 */
export function getValue(obj, name) {
	// 如果obj里面什么都没有 之间返回obj
	if (!obj) {
		return obj;
	}
	// 否则就是找{{obj.a}} 这样的值
	let nameList = name.split(".");
	let temp = obj;
	for (let i = 0; i < nameList.length; i++) {
		if (temp[nameList[i]]) {
			temp = temp[nameList[i]];
		} else {
			return undefined;
		}
	}
	return temp;
}

// _data = { msg: '2', desc: '3', obj: {x:'6', y: '9'} }
/**
 * 设置vue._data对象的值，例如input修改文本内容的值，data中属性也要续改
 * @param {*} obj vue对象的_data
 * @param {*} data 该元素绑定的属性的值
 * @param {*} value 该元素的新value
 * @return {*}
 */
export function setValue(obj, data, value) {
	if (!obj) return;
	let attrList = data.split(".");
	let temp = obj;
	for (let i = 0; i < attrList.length - 1; i++) {
		if (temp[attrList[i]]) {
			temp = temp[attrList[i]];
		} else {
			return;
		}
	}
	if (attrList[attrList.length - 1] !== null) {
		attrList[attrList.length - 1] = value;
	}
}
