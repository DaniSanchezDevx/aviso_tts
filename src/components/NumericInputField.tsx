import React, { useRef, useState } from 'react';
import { computeDniLetter } from '../types/dispatch';

interface NumericInputFieldProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
  allowDashButton?: boolean;
  isDni?: boolean;
  isPhone?: boolean;
}

export const NumericInputField: React.FC<NumericInputFieldProps> = ({
  id,
  label,
  value,
  placeholder,
  onChange,
  allowDashButton = false,
  isDni = false,
  isPhone = false,
}) => {
  const [textKeyboard, setTextKeyboard] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const dniLetter = isDni ? computeDniLetter(value) : null;

  const toggleKeyboard = () => {
    setTextKeyboard((prev) => !prev);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleAppendDash = () => {
    onChange(`${value}-`);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handleApplyDniLetter = () => {
    if (!dniLetter) return;
    onChange(`${value.trim()}${dniLetter}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <label
          htmlFor={id}
          className="block text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>

        <div className="flex items-center gap-1.5">
          {dniLetter && (
            <button
              type="button"
              onClick={handleApplyDniLetter}
              className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors whitespace-nowrap"
            >
              + Letra ({dniLetter})
            </button>
          )}
          {allowDashButton && (
            <button
              type="button"
              onClick={handleAppendDash}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
              title="Añadir guión"
            >
              + -
            </button>
          )}
          {!isPhone && (
            <button
              type="button"
              onClick={toggleKeyboard}
              className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors whitespace-nowrap"
            >
              {textKeyboard ? '123' : 'ABC'}
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        id={id}
        type={isPhone ? 'tel' : 'text'}
        inputMode={textKeyboard ? 'text' : isPhone ? 'tel' : 'numeric'}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 font-mono text-base text-slate-900 dark:text-white placeholder:font-sans placeholder:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0B5ED7] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
      />
    </div>
  );
};
