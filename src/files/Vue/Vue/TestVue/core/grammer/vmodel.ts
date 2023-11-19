import { setValue } from "../utils/ObjectUtil";
/**
 * 当元素内容被改动时，对应的data中的内容也要被改动
 * @param {*} vm vue实例
 * @param {*} elm 真实元素
 * @param {*} data 元素属性对应的值  例如他 v-model="obj.x"  data = obj.x
 * @return {*}
 */
export function vmodel(vm, elm, data) {
	// input元素双向绑定的本质就是监听了元素的onchange事件
	elm.onchange = function (e) {
		// 触发时设置data中的数据
		setValue(vm, data, elm.value);
	};
}
