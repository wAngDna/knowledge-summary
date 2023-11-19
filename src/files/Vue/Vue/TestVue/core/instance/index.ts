import { initMinix } from "./init";
import { renderMinix } from "./render";
function Vue(options) {
	this._init(options);
	this._render(this, this._vnode);
}
initMinix(Vue);
renderMinix(Vue);

let vue = new Vue({
	data: {
		name: "123",
		obj: {
			a: 1,
			b: 2,
		},
	},
});
export default Vue;
