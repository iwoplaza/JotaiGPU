import { atom } from 'jotai/vanilla';
import type { Atom } from 'jotai/vanilla';
import tgpu from 'typegpu';
import { builtin, vec2f, vec4f } from 'typegpu/data';
import type { InferGPU, v2f, v4f } from 'typegpu/data';
import { setGpuContext } from './gpu-context.ts';
import { getRoot, getRootSync } from './root.ts';

export interface Pixel {
  type: 'pixel';
}

export function pixel(read: (input: { uv: v2f }) => v4f): Pixel {
  const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

  /**
   * A full-screen triangle vertex shader
   */
  const vertexMain = tgpu['~unstable'].vertexFn({
    in: { vertexIndex: builtin.vertexIndex },
    out: { pos: builtin.position, uv: vec2f },
  })((input) => {
    const pos = [vec2f(-1, -1), vec2f(3, -1), vec2f(-1, 3)];

    return {
      pos: vec4f(pos[input.vertexIndex] as v2f, 0, 1),
      uv: pos[input.vertexIndex] as v2f,
    };
  });

  const fragmentMain = tgpu['~unstable'].fragmentFn({
    in: { uv: vec2f },
    out: vec4f,
  })(read);

  const pipelineAtom = atom((get) => {
    const root = getRootSync(get);

    const valueDeps: Array<Atom<unknown>> = [];
    const pipeline = root['~unstable']
      .withVertex(vertexMain, {})
      .withFragment(fragmentMain, { format: presentationFormat })
      .createPipeline();

    setGpuContext({ get, valueDeps });
    root.unwrap(pipeline);
    setGpuContext(undefined);

    return [pipeline, valueDeps] as const;
  });

  const pixel = atom(async (get) => {
    await getRoot(get); // ensuring the root is available.
    const [pipeline, valueDeps] = get(pipelineAtom);
    const resultBuffer = get(resultBufferAtom);

    // Depending on the values of... our dependencies
    for (const dep of valueDeps) {
      get(dep);
    }

    // TODO: Pass in the amount of workgroups that the user configures
    pipeline.dispatchWorkgroups(1);
    return resultBuffer.read();
  });

  return gpuAtom;
}
