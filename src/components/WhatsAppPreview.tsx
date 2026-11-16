import React, { useState } from 'react';
import { Check, Copy, ExternalLink, Eye } from 'lucide-react';
import { DispatchData, formatWhatsAppMessage } from '../types/dispatch';

interface WhatsAppPreviewProps {
  data: DispatchData;
  copied: boolean;
  onCopy: () => void;
}

export const WhatsAppPreview: React.FC<WhatsAppPreviewProps> = ({
  data,
  copied,
  onCopy,
}) => {
  const [showRaw, setShowRaw] = useState(false);
  const message = formatWhatsAppMessage(data);
  const lines = message.split('\n');
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(message)}`;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-slate-500 dark:text-slate-400" aria-hidden="true" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Vista previa WhatsApp
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setShowRaw((prev) => !prev)}
          className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          {showRaw ? 'Ver con formato' : 'Ver con *asteriscos*'}
        </button>
      </div>

      {/* WhatsApp message bubble simulation */}
      <div className="mt-3 rounded-2xl bg-[#E7F8EE] dark:bg-[#132A20] border border-emerald-200/80 dark:border-emerald-900/60 p-4 text-[14px] leading-relaxed text-slate-900 dark:text-slate-100">
        {showRaw ? (
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed">
            {message}
          </pre>
        ) : (
          <div className="space-y-0.5 break-words">
            {lines.map((line, idx) => {
              const match = line.match(/^\*([^*]+)\*(.*)$/);
              if (match) {
                return (
                  <div key={idx}>
                    <strong className="font-bold">{match[1]}</strong>
                    <span>{match[2]}</span>
                  </div>
                );
              }
              return <div key={idx}>{line}</div>;
            })}
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={onCopy}
          className={`flex-1 min-h-[48px] px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.98] whitespace-nowrap ${
            copied
              ? 'bg-[#059669] text-white'
              : 'bg-[#0B5ED7] hover:bg-blue-700 text-white'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>¡Aviso copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Copiar aviso</span>
            </>
          )}
        </button>

        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[48px] px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
        >
          <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
