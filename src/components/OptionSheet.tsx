import React from 'react';
import { Check, Trash2, X } from 'lucide-react';

interface OptionSheetProps {
  isOpen: boolean;
  title: string;
  options: readonly string[];
  value: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}

export const OptionSheet: React.FC<OptionSheetProps> = ({
  isOpen,
  title,
  options,
  value,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="option-sheet-title"
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl pb-safe max-h-[82vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden shrink-0" />

        <div className="px-5 pt-2 sm:pt-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 id="option-sheet-title" className="text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar opciones"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-3 space-y-1.5">
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onSelect(opt);
                  onClose();
                }}
                className={`w-full min-h-[50px] px-4 rounded-2xl flex items-center justify-between text-left text-base font-medium transition-colors ${
                  selected
                    ? 'bg-blue-50 text-[#0B5ED7] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 font-semibold'
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{opt}</span>
                {selected && <Check className="h-5 w-5 shrink-0" />}
              </button>
            );
          })}

          {value && (
            <button
              type="button"
              onClick={() => {
                onSelect('');
                onClose();
              }}
              className="w-full min-h-[48px] mt-2 px-4 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Dejar sin seleccionar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
