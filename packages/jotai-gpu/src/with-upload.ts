import { atom } from 'jotai/vanilla';
import type { Atom, WritableAtom, PrimitiveAtom } from 'jotai/vanilla';
import type { d } from 'typegpu';
import { isPromiseLike } from './utils.ts';
import { getGpuContext } from './gpu-context.ts';
import { getRoot, getRootSync } from './root.ts';

export interface WithUpload<TSchema extends d.BaseData> {
  usage: ['uniform'];
  schema: TSchema;
  readonly $: d.InferGPU<TSchema>;
}

function isWritable(atom: unknown): atom is WritableAtom<unknown, unknown[], unknown> {
  return !!(atom as WritableAtom<unknown, unknown[], unknown>)?.write;
}

export function withUpload<TSchema extends d.AnyData, TValue extends d.Infer<TSchema>>(
  schema: TSchema,
  wrappedAtom: PrimitiveAtom<TValue>,
): PrimitiveAtom<TValue> & WithUpload<TSchema>;

export function withUpload<TSchema extends d.AnyData, TValue extends d.Infer<TSchema>>(
  schema: TSchema,
  wrappedAtom: Atom<TValue>,
): Atom<TValue> & WithUpload<TSchema>;

export function withUpload<TSchema extends d.AnyData, TValue extends d.Infer<TSchema>>(
  schema: TSchema,
  anAtom: Atom<TValue>,
): Atom<TValue> & WithUpload<TSchema> {
  let wrapperAtom: Atom<TValue> & WithUpload<TSchema>;

  const bufferAtom = atom((get) => {
    const root = getRootSync(get);
    return root.createBuffer(schema as d.AnyData).$usage('uniform');
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
    wrapperAtom = atom((get) => get(anAtom)) as unknown as Atom<TValue> & WithUpload<TSchema>;
  }

  const valueAttribs = {
    get() {
      // This will get called while resolving the shader program.
      // We want to subscribe to the buffer, not the buffer's value.
      // Otherwise, we would recompile the shader on every value change.
      const ctx = getGpuContext();
      const uniform = ctx.get(bufferAtom).as('uniform');
      ctx.valueDeps.push(wrapperAtom);
      return uniform.$;
    },
  };

  wrapperAtom.schema = schema;
  Object.defineProperty(wrapperAtom, '$', valueAttribs);

  return wrapperAtom;
}
