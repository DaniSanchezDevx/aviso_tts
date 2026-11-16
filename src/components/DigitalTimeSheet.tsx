import React, { useEffect, useRef, useState } from 'react';
import { Clock, Trash2, X, Check } from 'lucide-react';
import { getCurrentTimeHHMM } from '../types/dispatch';

interface DigitalTimeSheetProps {
  isOpen: boolean;
  title: string;
  value: string; // HH:mm or ''
  onSelect: (time: string) => void;
  onClose: () => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

export const DigitalTimeSheet: React.FC<DigitalTimeSheetProps> = ({
  isOpen,
  title,
  value,
  onSelect,
  onClose,
}) => {
  const [hour, setHour] = useState('00');
  const [minute, setMinute] = useState('00');

  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const initial = value || getCurrentTimeHHMM();
      const [h, m] = initial.split(':');
      const validH = HOURS.includes(h) ? h : '00';
      const validM = MINUTES.includes(m) ? m : '00';
      setHour(validH);
      setMinute(validM);

      // Scroll selected items into view smoothly
      requestAnimationFrame(() => {
        const hEl = hoursRef.current?.querySelector(`[data-hour="${validH}"]`);
        const mEl = minutesRef.current?.querySelector(`[data-minute="${validM}"]`);
        hEl?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
        mEl?.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
      });
    }
  }, [isOpen, value]);

  if (!isOpen) return null;

  const handleNow = () => {
    const now = getCurrentTimeHHMM();
    onSelect(now);
    onClose();
  };

  const handleConfirm = () => {
    onSelect(`${hour}:${minute}`);
    onClose();
  };

  const handleClear = () => {
    onSelect('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="digital-time-title"
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        <div className="px-5 pt-2 sm:pt-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <h3 id="digital-time-title" className="text-base font-bold text-slate-900 dark:text-white">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar selector de hora"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Digital Readout + Quick Actions */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5">
            <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {hour}:{minute}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNow}
              className="min-h-[44px] px-3.5 inline-flex items-center gap-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0B5ED7] dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Clock className="h-4 w-4" />
              <span>Ahora</span>
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Borrar hora"
                className="min-h-[44px] px-3 inline-flex items-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Borrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Dual Digital Columns: 00-23 | 00-59 */}
        <div className="px-5 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 text-center">
                Hora (00–23)
              </div>
              <div
                ref={hoursRef}
                className="h-56 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-1.5 space-y-1"
              >
                {HOURS.map((h) => {
                  const active = h === hour;
                  return (
                    <button
                      key={h}
                      type="button"
                      data-hour={h}
                      onClick={() => setHour(h)}
                      className={`w-full min-h-[44px] rounded-xl font-mono text-base font-semibold transition-colors flex items-center justify-center ${
                        active
                          ? 'bg-[#0B5ED7] text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                      }`}
                    >
                      {h}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 text-center">
                Minutos (00–59)
              </div>
              <div
                ref={minutesRef}
                className="h-56 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-1.5 space-y-1"
              >
                {MINUTES.map((m) => {
                  const active = m === minute;
                  return (
                    <button
                      key={m}
                      type="button"
                      data-minute={m}
                      onClick={() => setMinute(m)}
                      className={`w-full min-h-[44px] rounded-xl font-mono text-base font-semibold transition-colors flex items-center justify-center ${
                        active
                          ? 'bg-[#0B5ED7] text-white shadow-sm'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800'
                      }`}
                    >
                      {m}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            className="mt-4 w-full min-h-[48px] rounded-xl bg-[#0B5ED7] hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition"
          >
            <Check className="h-4 w-4" />
            <span>Aplicar {hour}:{minute}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
