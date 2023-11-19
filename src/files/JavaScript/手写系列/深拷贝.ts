/**
 * 深拷贝
 * @param {*} source
 * @param {*} map
 * @return {*}
 */
export default function deepClone(source, map = new Map()) {
	//判断source是不是对象
	if (source instanceof Object === false) return source; //根据source类型初始化结果变量
	let target = Array.isArray(source) ? [] : {};
	if (map.get(source)) {
		// 已存在则直接返回
		return map.get(source);
	}
	// 不存在则第一次设置
	map.set(source, target);
	for (let i in source) {
		// 判断是否是自身属性
		if (source.hasOwnProperty(i)) {
			//判断数据i的类型
			if (typeof source[i] === "object") {
				// 👇传递map
				target[i] = deepClone(source[i], map);
			} else {
				target[i] = source[i];
			}
		}
	}
	return target;
}
