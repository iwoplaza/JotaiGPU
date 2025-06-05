import { atom } from 'jotai/vanilla';
import type { Atom, SetStateAction, WritableAtom } from 'jotai/vanilla';
import type { AnyWgslData, Infer, InferGPU } from 'typegpu/data';
import { isPromiseLike } from './gpu-atom.ts';
import { getGpuContext } from './gpu-context.ts';
import { getRoot, getRootSync } from './root.ts';

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

	const bufferAtom = atom((get) => {
		const root = getRootSync(get);
		return root.createBuffer(schema as AnyWgslData).$usage('uniform');
	});

	if (isWritable(anAtom)) {
		wrapperAtom = atom(
			(get, { signal }) => {
				const value = get(anAtom);
				const rootOrPromise = getRoot(get);
				if (isPromiseLike(rootOrPromise)) {
					rootOrPromise.then(() => {
						if (signal.aborted) {
							return; // Nevermind
						}
						const buffer = get(bufferAtom);
						buffer.write(value); // Keeping the buffer in sync with the value
					});
				} else {
					const buffer = get(bufferAtom);
					buffer.write(value); // Keeping the buffer in sync with the value
				}

				return value;
			},
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

	const valueAttribs = {
		get() {
			// This will get called while resolving the shader program.
			// We want to subscribe to the buffer, not the buffer's value.
			// Otherwise, we will recompile the shader on every value change.
			const ctx = getGpuContext();
			const uniform = ctx.get(bufferAtom).as('uniform');
			ctx.valueDeps.push(wrapperAtom);
			return uniform.value;
		},
	};

	wrapperAtom.schema = schema;
	Object.defineProperty(wrapperAtom, 'value', valueAttribs);
	Object.defineProperty(wrapperAtom, '$', valueAttribs);

	return wrapperAtom;
}
