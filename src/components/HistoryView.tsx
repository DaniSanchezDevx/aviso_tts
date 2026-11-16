import React from 'react';
import { Check, Copy, FolderOpen, Trash2 } from 'lucide-react';
import { SavedDispatch, formatDisplayDate } from '../types/dispatch';

interface HistoryViewProps {
  items: SavedDispatch[];
  copiedId: string | null;
  onLoad: (item: SavedDispatch) => void;
  onCopy: (item: SavedDispatch) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  items,
  copiedId,
  onLoad,
  onCopy,
  onDelete,
  onClearAll,
}) => {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center">
        <p className="text-base font-semibold text-slate-900 dark:text-white">
          Aún no hay avisos guardados
        </p>
        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          Al copiar o guardar un aviso, aparecerá aquí guardado en tu móvil para poder completar las horas más tarde.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {items.length} {items.length === 1 ? 'aviso guardado en este dispositivo' : 'avisos guardados en este dispositivo'}
        </p>
        <button
          type="button"
          onClick={onClearAll}
          className="min-h-[36px] px-2.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          Vaciar historial
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => {
          const { data } = item;
          const title = data.asegurado.trim() || data.origen.trim() || 'Aviso sin nombre';
          const metaParts: string[] = [];
          if (data.fecha) metaParts.push(formatDisplayDate(data.fecha));
          if (data.provincia) metaParts.push(data.provincia);
          if (data.tipo) metaParts.push(data.tipo);

          const isCopied = copiedId === item.id;

          return (
            <div
              key={item.id}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                    {title}
                  </h3>
                  {metaParts.length > 0 && (
                    <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
                      {metaParts.map((part, idx) => (
                        <React.Fragment key={part + idx}>
                          {idx > 0 && <span aria-hidden="true">·</span>}
                          <span>{part}</span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  aria-label="Eliminar aviso"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {(data.origen || data.destino) && (
                <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  {data.origen && (
                    <div className="truncate">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Origen:</span>{' '}
                      {data.origen}
                    </div>
                  )}
                  {data.destino && (
                    <div className="truncate">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">Destino:</span>{' '}
                      {data.destino}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-xs">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 py-1.5 px-2">
                  <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">Llamada</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {data.horaLlamada || '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 py-1.5 px-2">
                  <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">Asistencia</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {data.horaAsistencia || '—'}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/70 py-1.5 px-2">
                  <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400">Destino</div>
                  <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                    {data.horaDestino || '—'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onLoad(item)}
                  className="flex-1 min-h-[44px] px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FolderOpen className="h-4 w-4" />
                  <span>Cargar / Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => onCopy(item)}
                  className={`flex-1 min-h-[44px] px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    isCopied
                      ? 'bg-[#059669] text-white'
                      : 'bg-[#0B5ED7] hover:bg-blue-700 text-white'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
