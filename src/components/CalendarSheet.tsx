import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X, Trash2 } from 'lucide-react';
import { getTodayISO } from '../types/dispatch';

interface CalendarSheetProps {
  isOpen: boolean;
  value: string; // YYYY-MM-DD
  onSelect: (isoDate: string) => void;
  onClose: () => void;
}

const MONTHS_ES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAYS_ES = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export const CalendarSheet: React.FC<CalendarSheetProps> = ({
  isOpen,
  value,
  onSelect,
  onClose,
}) => {
  const todayISO = getTodayISO();

  const getInitialMonth = () => {
    const base = value || todayISO;
    const [y, m] = base.split('-').map(Number);
    if (!isNaN(y) && !isNaN(m)) {
      return { year: y, month: m - 1 };
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  };

  const [viewDate, setViewDate] = useState(getInitialMonth);

  useEffect(() => {
    if (isOpen) {
      setViewDate(getInitialMonth());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, value]);

  if (!isOpen) return null;

  const { year, month } = viewDate;
  const firstDayOfMonth = new Date(year, month, 1);
  // Monday = 0 ... Sunday = 6
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const handlePrevMonth = () => {
    setViewDate((prev) =>
      prev.month === 0
        ? { year: prev.year - 1, month: 11 }
        : { year: prev.year, month: prev.month - 1 }
    );
  };

  const handleNextMonth = () => {
    setViewDate((prev) =>
      prev.month === 11
        ? { year: prev.year + 1, month: 0 }
        : { year: prev.year, month: prev.month + 1 }
    );
  };

  const formatISO = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const getTomorrowISO = () => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return formatISO(t.getFullYear(), t.getMonth(), t.getDate());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="calendar-sheet-title"
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white dark:bg-slate-900 border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl pb-safe"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto my-3 sm:hidden" />

        <div className="px-5 pt-2 sm:pt-5 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <h3 id="calendar-sheet-title" className="text-base font-bold text-slate-900 dark:text-white">
            Seleccionar fecha
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar calendario"
            className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-5 pt-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onSelect(todayISO);
              onClose();
            }}
            className="flex-1 min-h-[44px] rounded-xl bg-blue-50 dark:bg-blue-950/50 text-[#0B5ED7] dark:text-blue-400 text-sm font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => {
              onSelect(getTomorrowISO());
              onClose();
            }}
            className="flex-1 min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Mañana
          </button>
          {value && (
            <button
              type="button"
              onClick={() => {
                onSelect('');
                onClose();
              }}
              aria-label="Borrar fecha"
              className="min-h-[44px] px-3.5 flex items-center justify-center gap-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Borrar</span>
            </button>
          )}
        </div>

        <div className="px-5 pt-4 pb-5">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Mes anterior"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-base font-bold text-slate-900 dark:text-white">
              {MONTHS_ES[month]} {year}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Mes siguiente"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAYS_ES.map((day) => (
              <div
                key={day}
                className="h-9 flex items-center justify-center text-xs font-semibold text-slate-400 dark:text-slate-500"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} className="h-11" />;
              }
              const cellISO = formatISO(year, month, day);
              const isSelected = value === cellISO;
              const isToday = todayISO === cellISO;

              return (
                <button
                  key={cellISO}
                  type="button"
                  onClick={() => {
                    onSelect(cellISO);
                    onClose();
                  }}
                  className={`h-11 w-full rounded-xl text-sm font-mono font-semibold transition-colors flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#0B5ED7] text-white shadow-sm'
                      : isToday
                      ? 'bg-blue-50 text-[#0B5ED7] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
