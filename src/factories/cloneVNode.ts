import {
	isUndefined,
	isArray,
	isNull,
	isNullOrUndef
} from '../shared';
import {
	createVNode,
	VNodeFlags,
	isVNode
} from '../core/shapes';

export default function cloneVNode(vNodeToClone, props?, ..._children) {
	let children: any = _children;

	if (_children.length > 0 && !isNull(_children[0])) {
		if (!props) {
			props = {};
		}
		if (_children.length === 1) {
			children = _children[0];
		}
		if (isUndefined(props.children)) {
			props.children = children;
		} else {
			if (isArray(children)) {
				if (isArray(props.children)) {
					props.children = props.children.concat(children);
				} else {
					props.children = [props.children].concat(children);
				}
			} else {
				if (isArray(props.children)) {
					props.children.push(children);
				} else {
					props.children = [props.children];
					props.children.push(children);
				}
			}
		}
	}
	children = null;
	const flags = vNodeToClone.flags;
	let newVNode;

	if (isArray(vNodeToClone)) {
		newVNode = vNodeToClone.map(vNode => cloneVNode(vNode));
	} else if (isNullOrUndef(props) && isNullOrUndef(children)) {
		newVNode = Object.assign({}, vNodeToClone);
	} else {
		const key = !isNullOrUndef(vNodeToClone.key) ? vNodeToClone.key : props.key;
		const ref = vNodeToClone.ref || props.ref;

		if (flags & VNodeFlags.Component) {
			newVNode = createVNode(flags, vNodeToClone.type,
				Object.assign({}, vNodeToClone.props, props),
				null,
				key,
				ref,
				true
			);
		} else if (flags & VNodeFlags.Element) {
			children = (props && props.children) || vNodeToClone.children;
			newVNode = createVNode(flags, vNodeToClone.type,
				Object.assign({}, vNodeToClone.props, props),
				children,
				key,
				ref,
				!children
			);
		}
	}
	if (flags & VNodeFlags.Component) {
		const props = newVNode.props;
		// we need to also clone component children that are in props
		// as the children may also have been hoisted
		if (props && props.children) {
			const children = props.children;

			if (isArray(children)) {
				for (let i = 0; i < children.length; i++) {
					props.children[i] = cloneVNode(children[i])
				}
			} else if (isVNode(children)) {
				props.children = cloneVNode(children)
			}
		}
		newVNode.children = null;
	}
	newVNode.dom = null;
	return newVNode;
}
