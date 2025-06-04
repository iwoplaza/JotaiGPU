import { atomWithLazy } from 'jotai/utils';
import tgpu from 'typegpu';

export const rootAtom = atomWithLazy(async () => {
	const root = await tgpu.init();
	return root;
});
