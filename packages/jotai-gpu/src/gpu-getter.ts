import type { Getter } from 'jotai/vanilla';

let gpuGetter: Getter | undefined;

export function getGpuGetter(): Getter {
	if (!gpuGetter) {
		throw new Error(
			'Cannot access atoms with .value or .$ outside of GPU atoms.',
		);
	}
	return gpuGetter;
}

export function setGpuGetter(get: Getter | undefined): void {
	gpuGetter = get;
}
