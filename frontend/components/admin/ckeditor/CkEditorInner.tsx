'use client';

/**
 * CkEditorInner — the real CKEditor 5 instance (loaded client-side only via
 * next/dynamic in CkEditor.tsx).
 *
 * - Uses the open-source `ckeditor5` package (GPL license key)
 * - Custom upload adapter → POST /admin/upload (Laravel, Bearer token)
 * - General HTML Support keeps custom block HTML (classes/styles) intact so
 *   previously saved content and inserted blocks round-trip safely.
 */

import { CKEditor } from '@ckeditor/ckeditor5-react';
import { useEffect, useRef, useState } from 'react';
import {
  Alignment,
  Autoformat,
  BlockQuote,
  Bold,
  ClassicEditor,
  Code,
  CodeBlock,
  Essentials,
  FontBackgroundColor,
  FontColor,
  GeneralHtmlSupport,
  Heading,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SourceEditing,
  Strikethrough,
  Table,
  TableToolbar,
  TextTransformation,
  Underline,
  WordCount,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const UPLOAD_URL = `${API_BASE_URL}/admin/upload`;

function getAdminToken(): string | null {
  try {
    const raw = localStorage.getItem('admin-auth-storage');
    if (!raw) return null;
    const { state } = JSON.parse(raw);
    return state?.token || null;
  } catch {
    return null;
  }
}

/** Minimal CKEditor upload adapter backed by the admin media endpoint. */
class AdminUploadAdapter {
  loader: any;
  xhr: XMLHttpRequest | null = null;

  constructor(loader: any) {
    this.loader = loader;
  }

  upload() {
    return this.loader.file.then(
      (file: File) =>
        new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          this.xhr = xhr;
          xhr.open('POST', UPLOAD_URL, true);
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          const token = getAdminToken();
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

          xhr.addEventListener('load', () => {
            const res = xhr.response;
            if (!res || xhr.status < 200 || xhr.status >= 300) {
              reject(res?.message || `Upload failed (${xhr.status})`);
              return;
            }
            resolve({ default: res.url });
          });
          xhr.addEventListener('error', () => reject('Network error during upload'));
          xhr.addEventListener('abort', () => reject('Upload aborted'));
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              this.loader.uploadTotal = e.total;
              this.loader.uploaded = e.loaded;
            }
          });

          const data = new FormData();
          data.append('file', file);
          xhr.send(data);
        })
    );
  }

  abort() {
    this.xhr?.abort();
  }
}

function AdminUploadAdapterPlugin(this: any, editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) =>
    new AdminUploadAdapter(loader);
}

export interface CkEditorInnerProps {
  value: string;
  onChange: (html: string) => void;
  onInstance?: (editor: any) => void;
  placeholder?: string;
  /**
   * Distance from the top of the viewport (px) where CKEditor's sticky toolbar
   * should pin — i.e. the AdminHeader height plus the height of the pinned
   * Blocks/Templates bar above the editor.
   */
  stickyToolbarOffset?: number;
}

/**
 * The slice of the CKEditor instance the sticky toolbar needs: it reads
 * `ui.viewportOffset` (config: `ui.viewportOffset.top`) and re-measures on
 * demand. Kept structural so the helper stays out of CKEditor internals.
 */
interface StickyToolbarHost {
  ui?: {
    viewportOffset?: Record<string, unknown> & { top?: number };
    view?: { stickyPanel?: { checkIfShouldBeSticky?: () => void } };
  };
}

/**
 * Pushes the viewport offset into CKEditor's StickyToolbar plugin
 * (`ui.viewportOffset.top` → `stickyPanel.viewportTopOffset`, CKEditor 5 v48).
 * The sticky panel only re-measures on scroll, so ask it to re-check after the
 * offset changes (e.g. when the Blocks bar wraps onto a second line).
 */
function applyStickyToolbarOffset(editor: StickyToolbarHost | null | undefined, offset: number) {
  const ui = editor?.ui;
  if (!ui?.viewportOffset) return;
  if (ui.viewportOffset.top !== offset) {
    ui.viewportOffset = { ...ui.viewportOffset, top: offset };
  }
  ui.view?.stickyPanel?.checkIfShouldBeSticky?.();
}

export default function CkEditorInner({
  value,
  onChange,
  onInstance,
  placeholder,
  stickyToolbarOffset = 0,
}: CkEditorInnerProps) {
  const [wordStats, setWordStats] = useState<{ words: number; characters: number } | null>(null);
  const editorInstanceRef = useRef<any>(null);

  // Keep the sticky toolbar in sync when the panel height changes (responsive).
  useEffect(() => {
    applyStickyToolbarOffset(editorInstanceRef.current, stickyToolbarOffset);
  }, [stickyToolbarOffset]);

  return (
    <div className="ck-editor-shell overflow-hidden rounded-xl border border-gray-300 bg-white">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        onReady={(editor: any) => {
          editorInstanceRef.current = editor;
          applyStickyToolbarOffset(editor, stickyToolbarOffset);
          onInstance?.(editor);

          const wordCount = editor.plugins.get('WordCount');
          if (wordCount) {
            setWordStats({ words: wordCount.words, characters: wordCount.characters });
            wordCount.on('update', (evt: any) => {
              const plugin = evt.source;
              setWordStats({ words: plugin.words, characters: plugin.characters });
            });
          }
        }}
        onChange={(_event: any, editor: any) => {
          onChange(editor.getData());
        }}
        config={{
          licenseKey: 'GPL',
          placeholder: placeholder || 'Start writing your article…',
          // Pin the sticky toolbar below the AdminHeader + Blocks/Templates bar.
          ui: {
            viewportOffset: { top: stickyToolbarOffset },
          },
          plugins: [
            Essentials,
            Autoformat,
            Paragraph,
            Heading,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Code,
            Link,
            List,
            Alignment,
            FontColor,
            FontBackgroundColor,
            RemoveFormat,
            BlockQuote,
            CodeBlock,
            HorizontalLine,
            Table,
            TableToolbar,
            Image,
            ImageInsert,
            ImageUpload,
            ImageToolbar,
            ImageStyle,
            ImageCaption,
            ImageResize,
            GeneralHtmlSupport,
            SourceEditing,
            PasteFromOffice,
            TextTransformation,
            WordCount,
            AdminUploadAdapterPlugin as any,
          ],
          toolbar: {
            items: [
              'heading',
              '|',
              'bold',
              'italic',
              'underline',
              'strikethrough',
              'code',
              'link',
              '|',
              'bulletedList',
              'numberedList',
              '|',
              'fontColor',
              'fontBackgroundColor',
              '|',
              'alignment',
              '|',
              'blockQuote',
              'codeBlock',
              'insertTable',
              'horizontalLine',
              'insertImage',
              '|',
              'removeFormat',
              'sourceEditing',
            ],
            shouldNotGroupWhenFull: false,
          },
          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading2', view: 'h2', title: 'Section Heading (H2)', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Sub Heading (H3)', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Minor Heading (H4)', class: 'ck-heading_heading4' },
            ],
          },
          image: {
            toolbar: [
              'imageStyle:inline',
              'imageStyle:block',
              'imageStyle:side',
              '|',
              'toggleImageCaption',
              'imageTextAlternative',
            ],
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
          },
          htmlSupport: {
            // Keep custom block HTML (classes/styles on divs, figures, spans…)
            // intact so inserted blocks and legacy content round-trip safely.
            allow: [{ name: /.*/, classes: true, styles: true, attributes: true }],
          },
          wordCount: {
            displayWords: false,
            displayCharacters: false,
          },
        }}
      />
      {wordStats && (
        <div className="flex items-center justify-end gap-4 border-t border-gray-100 bg-gray-50 px-4 py-1.5 text-xs text-gray-500">
          <span>
            <strong className="text-gray-700">{wordStats.words}</strong> words
          </span>
          <span>
            <strong className="text-gray-700">{wordStats.characters}</strong> characters
          </span>
        </div>
      )}
    </div>
  );
}

