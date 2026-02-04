'use client';
import { useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });

interface Props {
  className?: string;
  height?: number;
  value: string;
  onChange: (value: string) => void;
}

export default function JoditEditorWrapper({ className, height, value, onChange }: Props) {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      height,
      toolbarAdaptive: true,
      toolbarSticky: true,
      showCharsCounter: true,
      showWordsCounter: true,
      showXPathInStatusbar: true,
      askBeforePasteHTML: true,
      askBeforePasteFromWord: true,
      processPasteHTML: true,

      buttons: [
        'source',
        '|',
        'font',
        'fontsize',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        'eraser',
        'superscript',
        'subscript',
        '|',
        'font',
        'fontsize',
        'brush',
        'paragraph',
        'align',

        'classSpan',
        '|',
        'ul',
        'ol',
        'outdent',
        'indent',
        '|',
        'align',
        'lineHeight',
        '|',
        'link',
        'unlink',
        'anchor',
        '|',
        'image',
        'video',
        'file',
        'table',
        '|',
        'hr',

        'symbols',
        'emoji',
        'specialCharacters',
        '|',
        'code',
        'copyformat',
        'selectall',
        '|',
        'cut',
        'copy',
        'paste',
        'pastefromword',
        '|',
        'find',
        'replace',
        '|',
        'undo',
        'redo',
        '|',
        'hr',
        'preview',
        'print',
        'fullscreen',
        '|',
        'spellcheck',
        'about',
      ],
      style: {
        font: true,
      },
      font: {
        fontSize: true,
        fontFamily: true,
      },
      controls: {
        font: {
          list: {
            Arial: 'Arial',
            Georgia: 'Georgia',
            Impact: 'Impact',
            Tahoma: 'Tahoma',
            'Times New Roman': 'Times New Roman',
            Verdana: 'Verdana',
          },
        },
        fontsize: {
          list: ['8', '10', '12', '14', '16', '18', '24', '30', '36', '48'],
        },
        lineHeight: {
          list: ['1', '1.2', '1.4', '1.6', '2'],
        },
      },

      uploader: {
        insertImageAsBase64URI: true,
      },

      filebrowser: {
        ajax: {
          url: '',
        },
      },
    }),
    [height]
  );

  return <JoditEditor className={className} ref={editor} value={value} config={config} onBlur={(newContent) => onChange(newContent)} />;
}
