import { type RefObject, useMemo, useRef } from "react";
import type { Pixel } from "../pixel.ts";

type UseDrawReturn = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
};

export function useDraw(pixel: Pixel): UseDrawReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // TODO: Implement
  return useMemo(
    () => ({
      canvasRef,
    }),
    [],
  );
}
