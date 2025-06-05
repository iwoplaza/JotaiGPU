import type { SetStateAction } from 'jotai';
import type { WritableAtom } from 'jotai';
import { atom, type Atom } from 'jotai';
import type { AnyWgslData, Infer, InferGPU } from 'typegpu/data';
import { getGpuGetter } from './gpu-getter.ts';
import { getRoot } from './root.ts';
import { isPromiseLike } from './gpu-atom.ts';

export interface WithUpload<TSchema extends AnyWgslData> {
	usage: ['uniform'];
	schema: TSchema;
	value: InferGPU<TSchema>;
	$: InferGPU<TSchema>;
}

function isWritable(
	atom: unknown,
): atom is WritableAtom<unknown, unknown[], unknown> {
	return !!(atom as WritableAtom<unknown, unknown[], unknown>)?.write;
}

export function withUpload<
	TSchema extends AnyWgslData,
	TValue extends Infer<TSchema>,
>(
	schema: TSchema,
	wrappedAtom: WritableAtom<TValue, [SetStateAction<TValue>], void>,
): WritableAtom<TValue, [SetStateAction<TValue>], void> & WithUpload<TSchema>;

export function withUpload<
	TSchema extends AnyWgslData,
	TValue extends Infer<TSchema>,
>(
	schema: TSchema,
	wrappedAtom: Atom<TValue>,
): Atom<TValue> & WithUpload<TSchema>;

export function withUpload<
	TSchema extends AnyWgslData,
	TValue extends Infer<TSchema>,
>(schema: TSchema, anAtom: Atom<TValue>): Atom<TValue> & WithUpload<TSchema> {
	let wrapperAtom: Atom<TValue> & WithUpload<TSchema>;

	if (isWritable(anAtom)) {
		wrapperAtom = atom(
			(get) => get(anAtom),
			(_get, set, value: TValue) => {
				if ('write' in anAtom) {
					set(anAtom, value);
				}
			},
		) as unknown as Atom<TValue> & WithUpload<TSchema>;
	} else {
		wrapperAtom = atom((get) => get(anAtom)) as unknown as Atom<TValue> &
			WithUpload<TSchema>;
	}

	const bufferAtom = atom((get) => {
		const root = getRoot(get);
		if (isPromiseLike(root)) {
			throw new Error(
				'Invariant: The root should already be defined at this point.',
			);
		}
		return root.createBuffer(schema as AnyWgslData).$usage('uniform');
	});

	const valueAttribs = {
		get() {
			const get = getGpuGetter();
			const value = get(wrapperAtom);
			const buffer = get(bufferAtom);
			buffer.write(value);
			const uniform = buffer.as('uniform');
			return uniform.value;
		},
	};

	Object.defineProperty(wrapperAtom, 'value', valueAttribs);
	Object.defineProperty(wrapperAtom, '$', valueAttribs);

	wrapperAtom.schema = schema;

	return wrapperAtom;
}
