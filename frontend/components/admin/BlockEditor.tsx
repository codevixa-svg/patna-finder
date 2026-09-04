'use client';

import { useEffect, useRef, useState } from 'react';
import { adminMediaApi } from '@/lib/adminApi';

/**
 * BlockEditor — template-block content builder for blog posts.
 * Generates styled HTML (Tailwind classes compiled from this file)
 * that renders beautifully inside the public blog page.
 */

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'card'
  | 'list'
  | 'button'
  | 'badges'
  | 'image'
  | 'gallery'
  | 'quote'
  | 'alert'
  | 'divider'
  | 'html';

export interface EditorBlock {
  id: string;
  type: BlockType;
  data: Record<string, any>;
}

interface BlockEditorProps {
  value: string;
  onChange: (html: string) => void;
}

const uid = () => `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// Literal class strings so Tailwind compiles them for the rendered article
const CARD_COLORS: Record<string, string> = {
  amber: 'border-amber-300 bg-amber-50',
  blue: 'border-blue-300 bg-blue-50',
  green: 'border-green-300 bg-green-50',
  purple: 'border-purple-300 bg-purple-50',
  red: 'border-red-300 bg-red-50',
  gray: 'border-gray-300 bg-gray-50',
};

const BADGE_COLORS: Record<string, string> = {
  amber: 'bg-amber-100 text-amber-800',
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  red: 'bg-red-100 text-red-800',
  purple: 'bg-purple-100 text-purple-800',
  gray: 'bg-gray-100 text-gray-700',
};

const BUTTON_VARIANTS: Record<string, string> = {
  dark: 'bg-gray-900 text-white hover:bg-gray-800',
  amber: 'bg-amber-400 text-gray-900 hover:bg-amber-500',
  blue: 'bg-blue-600 text-white hover:bg-blue-700',
  outline: 'bg-white text-gray-900 border-2 border-gray-300 hover:border-gray-400',
};

const ALERT_VARIANTS: Record<string, { box: string; icon: string; label: string }> = {
  info: { box: 'bg-blue-50 border-blue-400 text-blue-900', icon: 'ℹ️', label: 'Info' },
  success: { box: 'bg-green-50 border-green-400 text-green-900', icon: '✅', label: 'Success' },
  warning: { box: 'bg-yellow-50 border-yellow-400 text-yellow-900', icon: '⚠️', label: 'Warning' },
  danger: { box: 'bg-red-50 border-red-400 text-red-900', icon: '🚫', label: 'Important' },
};

const LIST_MARKERS: Record<string, { marker: string; color: string }> = {
  check: { marker: '✔', color: 'text-green-600' },
  arrow: { marker: '→', color: 'text-amber-600' },
  dot: { marker: '•', color: 'text-gray-400' },
  star: { marker: '★', color: 'text-amber-500' },
};

function escapeHtml(str: string) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function serializeBlock(b: EditorBlock): string {
  const d = b.data;
  switch (b.type) {
    case 'paragraph':
      return `<p class="mb-4 leading-relaxed text-gray-700" style="text-align:${d.align || 'left'}">${escapeHtml(d.text).replace(/\n/g, '<br/>')}</p>`;
    case 'heading': {
      const cls =
        d.level === 'h3'
          ? 'mt-8 mb-3 text-xl font-bold text-gray-900 md:text-2xl'
          : 'mt-10 mb-4 text-2xl font-bold text-gray-900 md:text-3xl';
      return `<${d.level || 'h2'} class="${cls}" style="text-align:${d.align || 'left'}">${escapeHtml(d.text)}</${d.level || 'h2'}>`;
    }
    case 'card':
      return `<div class="my-8 rounded-2xl border-2 ${CARD_COLORS[d.color] || CARD_COLORS.amber} p-6 shadow-sm"><h3 class="mb-2 text-xl font-bold text-gray-900">${escapeHtml(d.icon || '')} ${escapeHtml(d.title || '')}</h3><p class="leading-relaxed text-gray-600">${escapeHtml(d.text || '').replace(/\n/g, '<br/>')}</p>${d.linkUrl ? `<a href="${escapeHtml(d.linkUrl)}" target="${d.target || '_self'}" rel="noopener noreferrer" class="mt-4 inline-flex items-center gap-1 font-semibold text-amber-700 hover:text-amber-800">${escapeHtml(d.linkText || 'Read more')} →</a>` : ''}</div>`;
    case 'list': {
      if (d.style === 'number') {
        const items = (d.items || []).map((it: string) => `<li class="pl-1 text-gray-700">${escapeHtml(it)}</li>`).join('');
        return `<ol class="my-6 list-decimal space-y-2 pl-6 marker:font-bold marker:text-amber-600">${items}</ol>`;
      }
      const m = LIST_MARKERS[d.style] || LIST_MARKERS.check;
      const items = (d.items || []).map((it: string) => `<li class="flex items-start gap-2"><span class="${m.color} shrink-0 font-bold">${m.marker}</span><span class="text-gray-700">${escapeHtml(it)}</span></li>`).join('');
      return `<ul class="my-6 space-y-2">${items}</ul>`;
    }
    case 'button':
      return `<p class="my-6"><a href="${escapeHtml(d.url || '#')}" target="${d.target || '_self'}" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition ${BUTTON_VARIANTS[d.variant] || BUTTON_VARIANTS.dark}">${escapeHtml(d.label || 'Click here')} →</a></p>`;
    case 'badges': {
      const chips = (d.items || []).map((it: any) => `<span class="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${BADGE_COLORS[it.color] || BADGE_COLORS.amber}">${escapeHtml(it.text)}</span>`).join('');
      return `<div class="my-4 flex flex-wrap gap-2">${chips}</div>`;
    }
    case 'image':
      return `<figure class="my-8"><img src="${escapeHtml(d.url || '')}" alt="${escapeHtml(d.alt || '')}" class="w-full rounded-2xl shadow-md" loading="lazy" />${d.caption ? `<figcaption class="mt-2 text-center text-sm text-gray-500">${escapeHtml(d.caption)}</figcaption>` : ''}</figure>`;
    case 'gallery': {
      const figs = (d.images || []).map((img: any) => `<figure class="overflow-hidden rounded-xl shadow-sm"><img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt || '')}" class="h-48 w-full object-cover" loading="lazy" />${img.caption ? `<figcaption class="p-2 text-center text-xs text-gray-500">${escapeHtml(img.caption)}</figcaption>` : ''}</figure>`).join('');
      return `<div class="my-8 grid grid-cols-2 gap-3 md:grid-cols-3">${figs}</div>`;
    }
    case 'quote':
      return `<blockquote class="my-6 rounded-r-xl border-l-4 border-amber-400 bg-amber-50 py-3 pl-4 pr-4 italic text-gray-700">${escapeHtml(d.text || '')}${d.author ? `<cite class="mt-2 block text-sm font-semibold not-italic text-gray-500">— ${escapeHtml(d.author)}</cite>` : ''}</blockquote>`;
    case 'alert': {
      const v = ALERT_VARIANTS[d.variant] || ALERT_VARIANTS.info;
      return `<div class="my-6 flex items-start gap-3 rounded-xl border-l-4 ${v.box} p-4"><span class="shrink-0 text-lg">${v.icon}</span><div><p class="font-bold">${escapeHtml(d.title || v.label)}</p><p class="mt-0.5 text-sm opacity-90">${escapeHtml(d.text || '').replace(/\n/g, '<br/>')}</p></div></div>`;
    }
    case 'divider':
      return '<hr class="my-8 border-gray-200" />';
    case 'html':
    default:
      return d.code || '';
  }
}

function serializeAll(blocks: EditorBlock[]): string {
  return blocks.map(serializeBlock).join('\n');
}

// Ready-made section templates — insert multiple styled blocks at once
const TEMPLATES: { name: string; icon: string; build: () => EditorBlock[] }[] = [
  {
    name: 'Key Takeaways',
    icon: '⭐',
    build: () => [
      { id: uid(), type: 'card', data: { title: 'Key Takeaways', text: 'Quick summary of the most important points from this article.', icon: '📌', color: 'amber' } },
      { id: uid(), type: 'list', data: { style: 'check', items: ['First key point', 'Second key point', 'Third key point'] } },
    ],
  },
  {
    name: 'Steps / How-to',
    icon: '🪜',
    build: () => [
      { id: uid(), type: 'heading', data: { text: 'How to do it — step by step', level: 'h3', align: 'left' } },
      { id: uid(), type: 'list', data: { style: 'number', items: ['First step', 'Second step', 'Third step'] } },
    ],
  },
  {
    name: 'Pros & Cons',
    icon: '⚖️',
    build: () => [
      {
        id: uid(),
        type: 'html',
        data: {
          code: '<div class="my-8 grid gap-4 md:grid-cols-2"><div class="rounded-2xl border-2 border-green-300 bg-green-50 p-5"><h3 class="mb-3 text-lg font-bold text-green-900">✅ Pros</h3><ul class="space-y-2"><li class="flex items-start gap-2"><span class="shrink-0 font-bold text-green-600">✔</span><span class="text-gray-700">Advantage one</span></li><li class="flex items-start gap-2"><span class="shrink-0 font-bold text-green-600">✔</span><span class="text-gray-700">Advantage two</span></li></ul></div><div class="rounded-2xl border-2 border-red-300 bg-red-50 p-5"><h3 class="mb-3 text-lg font-bold text-red-900">❌ Cons</h3><ul class="space-y-2"><li class="flex items-start gap-2"><span class="shrink-0 font-bold text-red-600">✘</span><span class="text-gray-700">Drawback one</span></li><li class="flex items-start gap-2"><span class="shrink-0 font-bold text-red-600">✘</span><span class="text-gray-700">Drawback two</span></li></ul></div></div>',
        },
      },
    ],
  },
  {
    name: 'FAQ',
    icon: '❓',
    build: () => [
      { id: uid(), type: 'heading', data: { text: 'Frequently Asked Questions', level: 'h2', align: 'left' } },
      { id: uid(), type: 'heading', data: { text: 'Question one?', level: 'h3', align: 'left' } },
      { id: uid(), type: 'paragraph', data: { text: 'Answer to the first question.', align: 'left' } },
      { id: uid(), type: 'heading', data: { text: 'Question two?', level: 'h3', align: 'left' } },
      { id: uid(), type: 'paragraph', data: { text: 'Answer to the second question.', align: 'left' } },
    ],
  },
  {
    name: 'CTA Banner',
    icon: '📣',
    build: () => [
      {
        id: uid(),
        type: 'html',
        data: {
          code: '<div class="my-8 rounded-2xl bg-gray-900 p-8 text-center"><h3 class="mb-2 text-2xl font-bold text-white">Explore the best of Patna 🎉</h3><p class="mb-5 text-gray-300">Discover trusted businesses, hidden gems & local events near you.</p><a href="/" class="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-3 font-semibold text-gray-900 transition hover:bg-amber-500">Start Exploring →</a></div>',
        },
      },
    ],
  },
];

// Reusable image source: paste URL OR upload a file (multipart → /admin/upload)
export function ImageSourceInput({ label = 'Image', value, onChange }: { label?: string; value: string; onChange: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await adminMediaApi.upload(file);
      onChange(res.url);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Image upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste image URL or choose a file…"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-400"
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {uploading ? 'Uploading…' : '📁 Choose File'}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
      {value && (
        <div className="mt-2 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="h-14 w-24 rounded-lg border border-gray-200 object-cover" />
          <button type="button" onClick={() => onChange('')} className="text-xs text-red-500 hover:underline">
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

function defaultData(type: BlockType): Record<string, any> {
  switch (type) {
    case 'paragraph': return { text: 'Write your paragraph here…', align: 'left' };
    case 'heading': return { text: 'Section heading', level: 'h2', align: 'left' };
    case 'card': return { title: 'Card title', text: 'Card content goes here.', icon: '📌', color: 'amber', linkText: 'Read more', linkUrl: '', target: '_self' };
    case 'list': return { style: 'check', items: ['First item', 'Second item'] };
    case 'button': return { label: 'Button text', url: 'https://', variant: 'dark', target: '_self' };
    case 'badges': return { items: [{ text: 'New', color: 'amber' }, { text: 'Featured', color: 'blue' }] };
    case 'image': return { url: '', alt: '', caption: '' };
    case 'gallery': return { images: [{ url: '', alt: '', caption: '' }], columns: 3 };
    case 'quote': return { text: 'Quote text goes here…', author: '' };
    case 'alert': return { variant: 'info', title: 'Heads up!', text: 'Important note for readers.' };
    case 'divider': return {};
    case 'html': return { code: '<p class="mb-4 leading-relaxed text-gray-700">Custom HTML…</p>' };
    default: return {};
  }
}

const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: 'paragraph', label: 'Paragraph', icon: '¶' },
  { type: 'heading', label: 'Heading', icon: 'H' },
  { type: 'card', label: 'Card', icon: '🗂' },
  { type: 'list', label: 'List', icon: '☰' },
  { type: 'button', label: 'Link / Button', icon: '🔗' },
  { type: 'badges', label: 'Badges', icon: '🏷' },
  { type: 'image', label: 'Image', icon: '🖼' },
  { type: 'gallery', label: 'Multiple Images', icon: '🎞' },
  { type: 'quote', label: 'Quote', icon: '❝' },
  { type: 'alert', label: 'Alert Box', icon: '⚠' },
  { type: 'divider', label: 'Divider', icon: '—' },
  { type: 'html', label: 'Custom HTML', icon: '</>' },
];

export default function BlockEditor({ value, onChange }: BlockEditorProps) {
  const initialized = useRef(false);
  const [blocks, setBlocks] = useState<EditorBlock[]>(() =>
    value && value.trim() ? [{ id: uid(), type: 'html', data: { code: value } }] : []
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [htmlMode, setHtmlMode] = useState(false);

  useEffect(() => {
    initialized.current = true;
  }, []);

  // Blocks → HTML sync (skip the very first render to avoid loops)
  useEffect(() => {
    if (!initialized.current) return;
    onChange(serializeAll(blocks));
  }, [blocks]);

  const updateBlock = (id: string, data: Record<string, any>) => {
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, data: { ...b.data, ...data } } : b)));
  };

  const addBlock = (type: BlockType) => {
    const nb: EditorBlock = { id: uid(), type, data: defaultData(type) };
    setBlocks((prev) => [...prev, nb]);
    setExpandedId(nb.id);
    setTemplatesOpen(false);
  };

  const insertTemplate = (t: (typeof TEMPLATES)[number]) => {
    setBlocks((prev) => [...prev, ...t.build()]);
    setTemplatesOpen(false);
  };

  const moveBlock = (index: number, dir: -1 | 1) => {
    setBlocks((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  };

  const removeBlock = (id: string) => setBlocks((prev) => prev.filter((b) => b.id !== id));

  const duplicateBlock = (id: string) => {
    setBlocks((prev) => {
      const i = prev.findIndex((b) => b.id === id);
      if (i < 0) return prev;
      const copy: EditorBlock = { ...prev[i], id: uid(), data: JSON.parse(JSON.stringify(prev[i].data)) };
      return [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)];
    });
  };

  const renderSettings = (block: EditorBlock) => {
    const d = block.data;
    const set = (patch: Record<string, any>) => updateBlock(block.id, patch);
    const inputCls = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-400';
    switch (block.type) {
      case 'paragraph':
        return (
          <div className="space-y-2">
            <textarea value={d.text} onChange={(e) => set({ text: e.target.value })} rows={3} className={inputCls} placeholder="Paragraph text…" />
            <select value={d.align} onChange={(e) => set({ align: e.target.value })} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
              <option value="left">Align: Left</option>
              <option value="center">Align: Center</option>
              <option value="justify">Align: Justify</option>
            </select>
          </div>
        );
      case 'heading':
        return (
          <div className="space-y-2">
            <input type="text" value={d.text} onChange={(e) => set({ text: e.target.value })} className={inputCls} placeholder="Heading text…" />
            <div className="flex gap-2">
              <select value={d.level} onChange={(e) => set({ level: e.target.value })} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
                <option value="h2">H2 (big)</option>
                <option value="h3">H3 (small)</option>
              </select>
              <select value={d.align} onChange={(e) => set({ align: e.target.value })} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
                <option value="left">Align: Left</option>
                <option value="center">Align: Center</option>
              </select>
            </div>
          </div>
        );
      case 'card':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_5rem]">
              <input type="text" value={d.title} onChange={(e) => set({ title: e.target.value })} className={inputCls} placeholder="Card title…" />
              <input type="text" value={d.icon} onChange={(e) => set({ icon: e.target.value })} className={inputCls} placeholder="Icon 📌" />
            </div>
            <textarea value={d.text} onChange={(e) => set({ text: e.target.value })} rows={3} className={inputCls} placeholder="Card content…" />
            <select value={d.color} onChange={(e) => set({ color: e.target.value })} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
              {Object.keys(CARD_COLORS).map((c) => (<option key={c} value={c}>Color: {c}</option>))}
            </select>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input type="text" value={d.linkText} onChange={(e) => set({ linkText: e.target.value })} className={inputCls} placeholder="Link text (optional)" />
              <input type="text" value={d.linkUrl} onChange={(e) => set({ linkUrl: e.target.value })} className={inputCls} placeholder="Link URL (optional)" />
            </div>
          </div>
        );
      case 'list':
        return (
          <div className="space-y-2">
            <select value={d.style} onChange={(e) => set({ style: e.target.value })} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
              <option value="check">✔ Checkmarks</option>
              <option value="arrow">→ Arrows</option>
              <option value="dot">• Dots</option>
              <option value="star">★ Stars</option>
              <option value="number">1. Numbers</option>
            </select>
            {(d.items || []).map((item: string, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => { const items = [...d.items]; items[i] = e.target.value; set({ items }); }}
                  className={inputCls}
                  placeholder={`Item ${i + 1}`}
                />
                <button type="button" onClick={() => set({ items: d.items.filter((_: any, j: number) => j !== i) })} className="px-2 text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
            <button type="button" onClick={() => set({ items: [...(d.items || []), 'New item'] })} className="rounded-lg border border-dashed border-gray-400 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-amber-400 hover:text-amber-600">+ Add Item</button>
          </div>
        );
      case 'button':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <input type="text" value={d.label} onChange={(e) => set({ label: e.target.value })} className={inputCls} placeholder="Button label…" />
              <input type="text" value={d.url} onChange={(e) => set({ url: e.target.value })} className={inputCls} placeholder="https://link-url.com" />
            </div>
            <div className="flex gap-2">
              <select value={d.variant} onChange={(e) => set({ variant: e.target.value })} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
                {Object.keys(BUTTON_VARIANTS).map((v) => (<option key={v} value={v}>Style: {v}</option>))}
              </select>
              <select value={d.target} onChange={(e) => set({ target: e.target.value })} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
                <option value="_self">Same tab</option>
                <option value="_blank">New tab</option>
              </select>
            </div>
          </div>
        );
      case 'badges':
        return (
          <div className="space-y-2">
            {(d.items || []).map((item: any, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], text: e.target.value }; set({ items }); }}
                  className={inputCls}
                  placeholder="Badge text…"
                />
                <select
                  value={item.color}
                  onChange={(e) => { const items = [...d.items]; items[i] = { ...items[i], color: e.target.value }; set({ items }); }}
                  className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs"
                >
                  {Object.keys(BADGE_COLORS).map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
                <button type="button" onClick={() => set({ items: d.items.filter((_: any, j: number) => j !== i) })} className="px-2 text-red-400 hover:text-red-600">✕</button>
              </div>
            ))}
            <button type="button" onClick={() => set({ items: [...(d.items || []), { text: 'New badge', color: 'amber' }] })} className="rounded-lg border border-dashed border-gray-400 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-amber-400 hover:text-amber-600">+ Add Badge</button>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-2">
            <ImageSourceInput label="Image (URL or upload)" value={d.url} onChange={(url) => set({ url })} />
            <input type="text" value={d.alt} onChange={(e) => set({ alt: e.target.value })} className={inputCls} placeholder="Alt text (SEO & accessibility)…" />
            <input type="text" value={d.caption} onChange={(e) => set({ caption: e.target.value })} className={inputCls} placeholder="Caption (optional)…" />
          </div>
        );
      case 'gallery':
        return (
          <div className="space-y-3">
            {(d.images || []).map((img: any, i: number) => (
              <div key={i} className="rounded-lg border border-gray-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-500">Image {i + 1}</span>
                  <button type="button" onClick={() => set({ images: d.images.filter((_: any, j: number) => j !== i) })} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                </div>
                <ImageSourceInput label={`Image ${i + 1} (URL or upload)`} value={img.url} onChange={(url) => { const images = [...d.images]; images[i] = { ...images[i], url }; set({ images }); }} />
                <input
                  type="text"
                  value={img.alt}
                  onChange={(e) => { const images = [...d.images]; images[i] = { ...images[i], alt: e.target.value }; set({ images }); }}
                  className={`${inputCls} mt-2`}
                  placeholder="Alt text…"
                />
                <input
                  type="text"
                  value={img.caption}
                  onChange={(e) => { const images = [...d.images]; images[i] = { ...images[i], caption: e.target.value }; set({ images }); }}
                  className={`${inputCls} mt-2`}
                  placeholder="Caption (optional)…"
                />
              </div>
            ))}
            <button type="button" onClick={() => set({ images: [...(d.images || []), { url: '', alt: '', caption: '' }] })} className="rounded-lg border border-dashed border-gray-400 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:border-amber-400 hover:text-amber-600">+ Add Image</button>
          </div>
        );
      case 'quote':
        return (
          <div className="space-y-2">
            <textarea value={d.text} onChange={(e) => set({ text: e.target.value })} rows={2} className={inputCls} placeholder="Quote text…" />
            <input type="text" value={d.author} onChange={(e) => set({ author: e.target.value })} className={inputCls} placeholder="Author (optional)…" />
          </div>
        );
      case 'alert':
        return (
          <div className="space-y-2">
            <select value={d.variant} onChange={(e) => set({ variant: e.target.value })} className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs">
              {Object.entries(ALERT_VARIANTS).map(([k, v]) => (<option key={k} value={k}>{v.icon} {v.label}</option>))}
            </select>
            <input type="text" value={d.title} onChange={(e) => set({ title: e.target.value })} className={inputCls} placeholder="Alert title…" />
            <textarea value={d.text} onChange={(e) => set({ text: e.target.value })} rows={2} className={inputCls} placeholder="Alert text…" />
          </div>
        );
      case 'divider':
        return <p className="text-xs text-gray-400">Adds a subtle horizontal separator line.</p>;
      case 'html':
        return (
          <textarea
            value={d.code}
            onChange={(e) => set({ code: e.target.value })}
            rows={6}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-xs"
            placeholder="Raw HTML with Tailwind classes…"
          />
        );
      default:
        return null;
    }
  };

  if (htmlMode) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">HTML Source</span>
          <button type="button" onClick={() => setHtmlMode(false)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800">
            ← Back to Blocks
          </button>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={18}
          className="w-full rounded-lg border border-gray-300 p-3 font-mono text-xs"
          placeholder="<p>Custom HTML…</p>"
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      {/* Toolbar — add blocks, templates, HTML mode */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Add Block</span>
        {BLOCK_TYPES.map((bt) => (
          <button
            key={bt.type}
            type="button"
            onClick={() => addBlock(bt.type)}
            title={`Add ${bt.label}`}
            className="rounded-lg border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:border-amber-400 hover:bg-amber-50"
          >
            <span className="mr-1">{bt.icon}</span>
            {bt.label}
          </button>
        ))}
        <div className="relative ml-auto">
          <button
            type="button"
            onClick={() => setTemplatesOpen(!templatesOpen)}
            className="rounded-lg bg-amber-400 px-3 py-1.5 text-xs font-bold text-gray-900 hover:bg-amber-500"
          >
            ✨ Templates ▾
          </button>
          {templatesOpen && (
            <div className="absolute right-0 z-20 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
              {TEMPLATES.map((t) => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => insertTemplate(t)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-amber-50"
                >
                  <span>{t.icon}</span>
                  {t.name}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setHtmlMode(true)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
        >
          &lt;/&gt; HTML
        </button>
      </div>

      {/* Blocks list with live preview */}
      {blocks.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-300 bg-white py-10 text-center text-sm text-gray-400">
          Empty content — add blocks or insert a ready-made template above ☝️
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, index) => (
            <div key={block.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between bg-gray-100 px-3 py-1.5">
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === block.id ? null : block.id)}
                  className="text-xs font-bold uppercase text-gray-700"
                >
                  {BLOCK_TYPES.find((x) => x.type === block.type)?.icon} {block.type}
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} className="px-1 text-gray-500 hover:text-gray-900 disabled:opacity-30" title="Move up">↑</button>
                  <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1} className="px-1 text-gray-500 hover:text-gray-900 disabled:opacity-30" title="Move down">↓</button>
                  <button type="button" onClick={() => duplicateBlock(block.id)} className="px-1 text-gray-500 hover:text-gray-900" title="Duplicate">⧉</button>
                  <button type="button" onClick={() => removeBlock(block.id)} className="px-1 text-red-400 hover:text-red-600" title="Delete">✕</button>
                </div>
              </div>
              {expandedId === block.id && (
                <div className="border-b border-gray-100 p-3">{renderSettings(block)}</div>
              )}
              <div className="p-3">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">Live Preview</p>
                <div className="rounded-lg border border-gray-100 bg-white p-3" dangerouslySetInnerHTML={{ __html: serializeBlock(block) }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
