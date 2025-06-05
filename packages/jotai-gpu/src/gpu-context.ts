import type { Atom, Getter, Setter } from 'jotai/vanilla';

interface GpuContext {
	get: Getter;
	peek: Getter;
	set: Setter;
	valueUpdates: Array<() => void>;
	valueDeps: Array<Atom<unknown>>;
}

let gpuContext: GpuContext | undefined;

export function getGpuContext(): GpuContext {
	if (!gpuContext) {
		throw new Error(
			'Cannot access atoms with .value or .$ outside of GPU atoms.',
		);
	}
	return gpuContext;
}

export function setGpuContext(ctx: GpuContext | undefined): void {
	gpuContext = ctx;
}
