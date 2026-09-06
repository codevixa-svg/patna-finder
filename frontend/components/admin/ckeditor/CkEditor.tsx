'use client';

/**
 * CkEditor — admin blog content editor.
 *
 * Wraps CKEditor 5 (loaded client-side only) and adds a **Blocks &
 * Templates** panel above the toolbar:
 *  - Blocks: pre-styled theme blocks (callouts, quote, CTA, FAQ, cards…)
 *    inserted at the cursor position.
 *  - Templates: full article starters in one click.
 *
 * Same props contract as the old BlockEditor (value / onChange), so it is a
 * drop-in replacement in the blog create & edit forms.
 */

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { ChevronDown, LayoutTemplate, SquarePlus, X } from 'lucide-react';
import { ARTICLE_TEMPLATES, CONTENT_BLOCKS } from '../blogBlocks';
import type { CkEditorInnerProps } from './CkEditorInner';

const CkEditorInner = dynamic(() => import('./CkEditorInner'), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center rounded-xl border border-gray-300 bg-gray-50 text-sm text-gray-400">
      Loading editor…
    </div>
  ),
});

interface CkEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

type MenuKey = 'blocks' | 'templates' | null;

export default function CkEditor({ value, onChange, placeholder }: CkEditorProps) {
  const editorRef = useRef<any>(null);
  // HTML last emitted by the editor — guards against feedback loops when we
  // receive the value back from the parent form.
  const lastEmittedRef = useRef<string>(value);
  const [menu, setMenu] = useState<MenuKey>(null);
  const shellRef = useRef<HTMLDivElement>(null);

  // Sync external value changes (e.g. form reset) into the editor.
  useEffect(() => {
    if (value !== lastEmittedRef.current && editorRef.current) {
      lastEmittedRef.current = value;
      editorRef.current.setData(value);
    }
  }, [value]);

  // Close the panel on outside click / Escape.
  useEffect(() => {
    if (!menu) return;
    const onDocClick = (e: MouseEvent) => {
      if (shellRef.current && !shellRef.current.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const insertHtml = (html: string) => {
    const editor = editorRef.current;
    if (!editor) return;
    const viewFragment = editor.data.processor.toView(html);
    const modelFragment = editor.data.toModel(viewFragment);
    editor.model.insertContent(modelFragment);
    editor.editing.view.focus();
    setMenu(null);
  };

  return (
    <div ref={shellRef} className="relative">
      {/* ── Blocks & Templates panel ── */}
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMenu(menu === 'blocks' ? null : 'blocks')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            menu === 'blocks'
              ? 'bg-amber-400 text-gray-900'
              : 'border border-gray-300 bg-white text-gray-700 hover:border-amber-400 hover:text-amber-600'
          }`}
        >
          <SquarePlus size={15} /> Blocks
          <ChevronDown size={13} className={menu === 'blocks' ? 'rotate-180 transition' : 'transition'} />
        </button>
        <button
          type="button"
          onClick={() => setMenu(menu === 'templates' ? null : 'templates')}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
            menu === 'templates'
              ? 'bg-amber-400 text-gray-900'
              : 'border border-gray-300 bg-white text-gray-700 hover:border-amber-400 hover:text-amber-600'
          }`}
        >
          <LayoutTemplate size={15} /> Templates
          <ChevronDown size={13} className={menu === 'templates' ? 'rotate-180 transition' : 'transition'} />
        </button>
        <span className="text-xs text-gray-400">Insert ready-made theme blocks & full article starters</span>
      </div>

      {menu && (
        <div className="absolute left-0 top-full z-30 mt-1 w-[min(560px,90vw)] rounded-xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <p className="text-sm font-bold text-gray-900">
              {menu === 'blocks' ? 'Content Blocks' : 'Article Templates'}
            </p>
            <button
              type="button"
              onClick={() => setMenu(null)}
              aria-label="Close panel"
              className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={15} />
            </button>
          </div>
          <div className="max-h-[320px] overflow-y-auto p-2">
            {menu === 'blocks'
              ? CONTENT_BLOCKS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => insertHtml(b.html)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-amber-50"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-700">
                      {b.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">{b.label}</span>
                      <span className="block text-xs text-gray-500">{b.description}</span>
                    </span>
                  </button>
                ))
              : ARTICLE_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => insertHtml(t.html)}
                    className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-amber-50"
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm">
                      {t.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-gray-900">{t.label}</span>
                      <span className="block text-xs text-gray-500">{t.description}</span>
                    </span>
                  </button>
                ))}
          </div>
        </div>
      )}

      {/* ── CKEditor ── */}
      <CkEditorInner
        value={value}
        placeholder={placeholder}
        onInstance={(editor) => {
          editorRef.current = editor;
        }}
        onChange={(html) => {
          lastEmittedRef.current = html;
          onChange(html);
        }}
      />
    </div>
  );
}

