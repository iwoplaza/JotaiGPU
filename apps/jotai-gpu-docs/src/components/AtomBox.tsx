import catppucciMmocha from '@shikijs/themes/catppuccin-mocha';
import { type Atom, atom, useAtomValue } from 'jotai';
import { atomFamily, unwrap } from 'jotai/utils';
import { useMemo } from 'react';
import { createHighlighterCore } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';

interface AtomBoxProps {
  valueAtom: Atom<number | Promise<number>>;
  codeHtml: string;
}

const highlighter = await createHighlighterCore({
  themes: [catppucciMmocha],
  langs: [import('@shikijs/langs/typescript')],
  // `shiki/wasm` contains the wasm binary inlined as base64 string.
  engine: createOnigurumaEngine(import('shiki/wasm')),
});

const htmlAtoms = atomFamily((code: string) => {
  return atom(() =>
    highlighter.codeToHtml(code, {
      lang: 'typescript',
      theme: catppucciMmocha,
    }),
  );
});

export function CountDisplay(props: {
  countAtom: Atom<number> | Atom<Promise<number>>;
}) {
  const counter = useAtomValue(props.countAtom);

  return (
    <span className="flex justify-center items-center w-8 h-8 bg-slate-200">
      {counter}
    </span>
  );
}

export function AtomBox(props: AtomBoxProps) {
  const codeHtml = useAtomValue(htmlAtoms(props.codeHtml));
  const latestAtom = useMemo(
    () => unwrap(props.valueAtom, (prev) => prev),
    [props.valueAtom],
  );
  const currentAtom = useMemo(() => unwrap(props.valueAtom), [props.valueAtom]);
  const latest = useAtomValue(latestAtom);
  const current = useAtomValue(currentAtom);

  return (
    <article
      className={`w-min ${current === undefined ? 'opacity-50' : 'opacity-100 transition-all'}`}
    >
      <div className="bg-[#1e1e2e] rounded-md shadow-2xl">
        <div className="px-4 py-1 text-xs">
          <div
            // biome-ignore lint/security/noDangerouslySetInnerHtml: shiki
            dangerouslySetInnerHTML={{ __html: codeHtml }}
            className="**:!bg-transparent"
          />
        </div>
        <footer className="rounded-b-md bg-[#2b2b40] px-2 py-1 text-center">
          {latest ?? '🌀'}
        </footer>
      </div>
    </article>
  );
}
