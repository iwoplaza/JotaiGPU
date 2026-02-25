import { pixel } from 'jotai-gpu';
import { useDraw } from 'jotai-gpu/react';
import { ErrorBoundary } from 'react-error-boundary';
import * as d from 'typegpu/data';

const finalPixel = pixel(() => {
  'kernel';
  return d.vec4f(1, 0, 0, 1);
});

function CounterGraph() {
  const { canvasRef } = useDraw(finalPixel);

  return (
    <div>
      <canvas ref={canvasRef} width={400} height={400} />
    </div>
  );
}

export default function CounterGraphWrapper() {
  return (
    <ErrorBoundary
      fallback={
        <p className="mx-auto max-w-2xl text-center py-16 bg-gray-600/50">
          WebGPU is not supported in this browser{' '}
          <span className="whitespace-nowrap">:(</span>
        </p>
      }
    >
      <CounterGraph />
    </ErrorBoundary>
  );
}
