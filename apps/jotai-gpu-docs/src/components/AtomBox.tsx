'use client';

import { type Atom, atom, useAtomValue } from 'jotai';
import { unwrap } from 'jotai/utils';
import { atomFamily } from 'jotai-family';
import { useMemo, Suspense } from 'react';
import { codeToHtml } from 'shiki';

interface AtomBoxProps {
  valueAtom: Atom<number | Promise<number>>;
  codeHtml: string;
}

const htmlAtoms = atomFamily((code: string) => {
  return atom(() =>
    codeToHtml(code, {
      lang: 'typescript',
      theme: 'catppuccin-mocha',
    }),
  );
});

function AtomBoxContent(props: AtomBoxProps) {
  const codeHtml = useAtomValue(htmlAtoms(props.codeHtml));
  const latestAtom = useMemo(() => unwrap(props.valueAtom, (prev) => prev), [props.valueAtom]);
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

export function AtomBox(props: AtomBoxProps) {
  return (
    <Suspense
      fallback={
        <article className="w-min opacity-50">
          <div className="bg-[#1e1e2e] rounded-md shadow-2xl">
            <div className="px-4 py-6 text-xs text-white/30">Loading...</div>
          </div>
        </article>
      }
    >
      <AtomBoxContent {...props} />
    </Suspense>
  );
}
