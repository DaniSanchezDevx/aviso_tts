import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Copy,
  Eye,
  FilePlus2,
  History,
  Moon,
  Sun,
  X,
} from 'lucide-react';
import { CalendarSheet } from './components/CalendarSheet';
import { DigitalTimeSheet } from './components/DigitalTimeSheet';
import { HistoryView } from './components/HistoryView';
import { NumericInputField } from './components/NumericInputField';
import { OfflineIndicator } from './components/OfflineIndicator';
import { OptionSheet } from './components/OptionSheet';
import { PWAInstallButton } from './components/PWAInstallButton';
import { WhatsAppPreview } from './components/WhatsAppPreview';
import {
  DispatchData,
  EMPTY_DISPATCH,
  PROVINCIAS_CYL,
  SavedDispatch,
  TIPOS_SERVICIO,
  TipoServicio,
  formatDisplayDate,
  formatWhatsAppMessage,
  getCurrentTimeHHMM,
  hasAnyFilledContent,
} from './types/dispatch';

const STORAGE_DRAFT_KEY = 'avisos_tts_draft_v1';
const STORAGE_ACTIVE_ID_KEY = 'avisos_tts_active_id_v1';
const STORAGE_HISTORY_KEY = 'avisos_tts_history_v1';
const STORAGE_THEME_KEY = 'avisos_tts_theme_v1';

type TimeFieldKey = 'horaLlamada' | 'horaAsistencia' | 'horaDestino';

async function copyTextToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

function loadInitialDraft(): DispatchData {
  try {
    const raw = localStorage.getItem(STORAGE_DRAFT_KEY);
    if (raw) {
      return { ...EMPTY_DISPATCH, ...JSON.parse(raw) };
    }
  } catch {
    // Ignore storage error
  }
  return EMPTY_DISPATCH;
}

function loadInitialHistory(): SavedDispatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore storage error
  }
  return [];
}

function loadInitialTheme(): boolean {
  try {
    const saved = localStorage.getItem(STORAGE_THEME_KEY);
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
  } catch {
    // Ignore
  }
  return false;
}

export default function App() {
  const [data, setData] = useState<DispatchData>(loadInitialDraft);
  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    } catch {
      return null;
    }
  });
  const [history, setHistory] = useState<SavedDispatch[]>(loadInitialHistory);
  const [isDark, setIsDark] = useState<boolean>(loadInitialTheme);
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  // Modals / bottom sheets
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [provinciaOpen, setProvinciaOpen] = useState(false);
  const [tipoOpen, setTipoOpen] = useState(false);
  const [timePickerField, setTimePickerField] = useState<TimeFieldKey | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // Copy feedback
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedHistoryId, setCopiedHistoryId] = useState<string | null>(null);

  // Sync dark mode class on <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    try {
      localStorage.setItem(STORAGE_THEME_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Ignore
    }
  }, [isDark]);

  // Persist draft locally
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_DRAFT_KEY, JSON.stringify(data));
    } catch {
      // Ignore
    }
  }, [data]);

  useEffect(() => {
    try {
      if (activeId) {
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeId);
      } else {
        localStorage.removeItem(STORAGE_ACTIVE_ID_KEY);
      }
    } catch {
      // Ignore
    }
  }, [activeId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(history));
    } catch {
      // Ignore
    }
  }, [history]);

  const updateField = <K extends keyof DispatchData>(key: K, value: DispatchData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const upsertCurrentInHistory = (snapshot: DispatchData): string | null => {
    if (!hasAnyFilledContent(snapshot)) return activeId;
    const now = Date.now();
    const recordId = activeId || `aviso_${now}_${Math.random().toString(36).slice(2, 7)}`;

    setHistory((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === recordId);
      const nextItem: SavedDispatch = {
        id: recordId,
        updatedAt: now,
        data: snapshot,
      };
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy.splice(existingIdx, 1);
        return [nextItem, ...copy];
      }
      return [nextItem, ...prev].slice(0, 100);
    });

    if (!activeId) {
      setActiveId(recordId);
    }
    return recordId;
  };

  const handleCopyCurrent = async () => {
    const message = formatWhatsAppMessage(data);
    const ok = await copyTextToClipboard(message);
    if (ok) {
      upsertCurrentInHistory(data);
      setCopiedMain(true);
      setTimeout(() => setCopiedMain(false), 2200);
    }
  };

  const handleNewDispatch = () => {
    if (hasAnyFilledContent(data)) {
      upsertCurrentInHistory(data);
    }
    setData(EMPTY_DISPATCH);
    setActiveId(null);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadFromHistory = (item: SavedDispatch) => {
    setData({ ...EMPTY_DISPATCH, ...item.data });
    setActiveId(item.id);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyFromHistory = async (item: SavedDispatch) => {
    const ok = await copyTextToClipboard(formatWhatsAppMessage(item.data));
    if (ok) {
      setCopiedHistoryId(item.id);
      setTimeout(() => setCopiedHistoryId(null), 2200);
    }
  };

  const handleDeleteFromHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeId === id) {
      setActiveId(null);
    }
  };

  const handleClearHistory = () => {
    setHistory([]);
    setActiveId(null);
  };

  const timeFieldLabels: Record<TimeFieldKey, string> = {
    horaLlamada: 'Hora de llamada',
    horaAsistencia: 'Hora asistencia',
    horaDestino: 'Hora destino',
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] dark:bg-[#0B111A] text-slate-900 dark:text-slate-100 flex flex-col">
      <OfflineIndicator />

      {/* Header (non-sticky so mobile sticky cap remains well under 15%) */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/icon.svg"
              alt=""
              className="h-7 w-7 rounded-lg shrink-0"
              referrerPolicy="no-referrer"
            />
            <h1 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
              Avisos TTS
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />

            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={handleNewDispatch}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0"
            >
              <FilePlus2 className="h-4 w-4 text-[#0B5ED7] dark:text-blue-400" aria-hidden="true" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-28 lg:pb-10">
        {/* Top Segmented Tabs: Aviso | Historial */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="inline-flex p-1 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setActiveTab('form')}
              className={`flex-1 sm:flex-none min-h-[40px] px-4 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                activeTab === 'form'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Aviso actual
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`flex-1 sm:flex-none min-h-[40px] px-4 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <History className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Historial ({history.length})</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form or History */}
          <div className="lg:col-span-7">
            {activeTab === 'history' ? (
              <HistoryView
                items={history}
                copiedId={copiedHistoryId}
                onLoad={handleLoadFromHistory}
                onCopy={handleCopyFromHistory}
                onDelete={handleDeleteFromHistory}
                onClearAll={handleClearHistory}
              />
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCopyCurrent();
                }}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 space-y-6"
              >
                {/* Section 1: Servicio y lugar */}
                <section className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* FECHA */}
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300 mb-1.5">
                        FECHA
                      </label>
                      <button
                        type="button"
                        onClick={() => setCalendarOpen(true)}
                        className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span
                          className={`text-sm font-mono truncate ${
                            data.fecha
                              ? 'font-semibold text-slate-900 dark:text-white'
                              : 'font-sans text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {data.fecha ? formatDisplayDate(data.fecha) : 'Elegir día'}
                        </span>
                        <Calendar className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                      </button>
                    </div>

                    {/* PROVINCIA */}
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300 mb-1.5">
                        PROVINCIA
                      </label>
                      <button
                        type="button"
                        onClick={() => setProvinciaOpen(true)}
                        className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span
                          className={`text-sm truncate ${
                            data.provincia
                              ? 'font-medium text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {data.provincia || 'Castilla y León'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                      </button>
                    </div>

                    {/* TIPO */}
                    <div>
                      <label className="block text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300 mb-1.5">
                        TIPO
                      </label>
                      <button
                        type="button"
                        onClick={() => setTipoOpen(true)}
                        className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <span
                          className={`text-sm truncate ${
                            data.tipo
                              ? 'font-medium text-slate-900 dark:text-white'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}
                        >
                          {data.tipo || 'Seleccionar tipo'}
                        </span>
                        <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Section 2: Datos del paciente y póliza */}
                <section className="space-y-4">
                  {/* ASEGURADO */}
                  <div>
                    <label
                      htmlFor="field-asegurado"
                      className="block text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      ASEGURADO
                    </label>
                    <input
                      id="field-asegurado"
                      type="text"
                      autoCapitalize="words"
                      autoComplete="off"
                      value={data.asegurado}
                      onChange={(e) => updateField('asegurado', e.target.value)}
                      placeholder="Nombre y apellidos del paciente"
                      className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0B5ED7] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* DNI */}
                    <NumericInputField
                      id="field-dni"
                      label="DNI"
                      value={data.dni}
                      placeholder="Ej: 11682550E"
                      onChange={(val) => updateField('dni', val)}
                      isDni
                    />

                    {/* TELEFONO */}
                    <NumericInputField
                      id="field-telefono"
                      label="TELEFONO"
                      value={data.telefono}
                      placeholder="Ej: 649940048"
                      onChange={(val) => updateField('telefono', val)}
                      isPhone
                    />

                    {/* Nº PÓLIZA */}
                    <NumericInputField
                      id="field-poliza"
                      label="Nº PÓLIZA"
                      value={data.poliza}
                      placeholder="Ej: 100849601112-01"
                      onChange={(val) => updateField('poliza', val)}
                      allowDashButton
                    />

                    {/* Nº AUTORIZACION */}
                    <NumericInputField
                      id="field-autorizacion"
                      label="Nº AUTORIZACION"
                      value={data.autorizacion}
                      placeholder="Ej: 183138"
                      onChange={(val) => updateField('autorizacion', val)}
                    />
                  </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Section 3: Trayecto */}
                <section className="space-y-4">
                  {/* ORIGEN */}
                  <div>
                    <label
                      htmlFor="field-origen"
                      className="block text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      ORIGEN
                    </label>
                    <textarea
                      id="field-origen"
                      rows={2}
                      value={data.origen}
                      onChange={(e) => updateField('origen', e.target.value)}
                      placeholder="Dirección de recogida, hospital, habitación..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0B5ED7] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition resize-y"
                    />
                  </div>

                  {/* DESTINO */}
                  <div>
                    <label
                      htmlFor="field-destino"
                      className="block text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300 mb-1.5"
                    >
                      DESTINO
                    </label>
                    <textarea
                      id="field-destino"
                      rows={2}
                      value={data.destino}
                      onChange={(e) => updateField('destino', e.target.value)}
                      placeholder="Dirección de destino, localidad, domicilio..."
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0B5ED7] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition resize-y"
                    />
                  </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Section 4: Horas (siempre incluidas al copiar) */}
                <section className="space-y-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300">
                      HORAS DEL SERVICIO
                    </h2>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Siempre se copian en WhatsApp
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {(
                      [
                        { key: 'horaLlamada', label: 'HORA DE LLAMADA' },
                        { key: 'horaAsistencia', label: 'HORA ASISTENCIA' },
                        { key: 'horaDestino', label: 'HORA DESTINO' },
                      ] as { key: TimeFieldKey; label: string }[]
                    ).map(({ key, label }) => {
                      const val = data[key];
                      return (
                        <div key={key} className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold tracking-wide text-slate-600 dark:text-slate-400">
                              {label}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateField(key, getCurrentTimeHHMM())}
                              className="px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-[#0B5ED7] dark:text-blue-400 text-[11px] font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              Ahora
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => setTimePickerField(key)}
                            className="w-full min-h-[48px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 flex items-center justify-between gap-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <span
                              className={`font-mono text-base ${
                                val
                                  ? 'font-bold text-slate-900 dark:text-white'
                                  : 'text-slate-400 dark:text-slate-500 text-sm font-sans'
                              }`}
                            >
                              {val || '00:00 – 23:59'}
                            </span>
                            <Clock className="h-4 w-4 text-slate-400 shrink-0" aria-hidden="true" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <hr className="border-slate-100 dark:border-slate-800" />

                {/* Section 5: Anotaciones */}
                <section>
                  <label
                    htmlFor="field-anotaciones"
                    className="block text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    ANOTACIONES
                  </label>
                  <textarea
                    id="field-anotaciones"
                    rows={3}
                    value={data.anotaciones}
                    onChange={(e) => updateField('anotaciones', e.target.value)}
                    placeholder="Estado del paciente, camilla, silla, oxígeno, acompañante..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 px-3.5 py-2.5 text-base text-slate-900 dark:text-white placeholder:text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#0B5ED7] focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition resize-y"
                  />
                </section>
              </form>
            )}
          </div>

          {/* Right Column on Desktop: Sticky Live WhatsApp Preview */}
          <aside className="hidden lg:block lg:col-span-5 lg:sticky lg:top-6">
            <WhatsAppPreview
              data={data}
              copied={copiedMain}
              onCopy={handleCopyCurrent}
            />
          </aside>
        </div>
      </main>

      {/* Mobile Sticky Bottom Action Bar (single fixed surface <= 10% viewport height) */}
      {activeTab === 'form' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-4 pt-2.5 pb-safe">
          <div className="max-w-xl mx-auto flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen(true)}
              aria-label="Ver vista previa de WhatsApp"
              className="min-h-[48px] px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold inline-flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shrink-0 whitespace-nowrap"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              <span>Vista</span>
            </button>

            <button
              type="button"
              onClick={handleCopyCurrent}
              className={`flex-1 min-h-[48px] px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-colors whitespace-nowrap ${
                copiedMain
                  ? 'bg-[#059669] text-white'
                  : 'bg-[#0B5ED7] hover:bg-blue-700 text-white'
              }`}
            >
              {copiedMain ? (
                <>
                  <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>¡Copiado para WhatsApp!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Copiar aviso</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mobile WhatsApp Preview Sheet */}
      {mobilePreviewOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobilePreviewOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full rounded-t-3xl bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 pb-safe max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Mensaje para WhatsApp
              </span>
              <button
                type="button"
                onClick={() => setMobilePreviewOpen(false)}
                aria-label="Cerrar vista previa"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <WhatsAppPreview
              data={data}
              copied={copiedMain}
              onCopy={handleCopyCurrent}
            />
          </div>
        </div>
      )}

      {/* Calendar Picker Sheet */}
      <CalendarSheet
        isOpen={calendarOpen}
        value={data.fecha}
        onSelect={(iso) => updateField('fecha', iso)}
        onClose={() => setCalendarOpen(false)}
      />

      {/* Provincia Picker Sheet (Castilla y León) */}
      <OptionSheet
        isOpen={provinciaOpen}
        title="Provincia (Castilla y León)"
        options={PROVINCIAS_CYL}
        value={data.provincia}
        onSelect={(val) => updateField('provincia', val)}
        onClose={() => setProvinciaOpen(false)}
      />

      {/* Tipo Picker Sheet */}
      <OptionSheet
        isOpen={tipoOpen}
        title="Tipo de servicio"
        options={TIPOS_SERVICIO}
        value={data.tipo}
        onSelect={(val) => updateField('tipo', val as TipoServicio)}
        onClose={() => setTipoOpen(false)}
      />

      {/* Digital Time Picker Sheet (00:00 - 23:59) */}
      <DigitalTimeSheet
        isOpen={timePickerField !== null}
        title={timePickerField ? timeFieldLabels[timePickerField] : 'Seleccionar hora'}
        value={timePickerField ? data[timePickerField] : ''}
        onSelect={(time) => {
          if (timePickerField) {
            updateField(timePickerField, time);
          }
        }}
        onClose={() => setTimePickerField(null)}
      />
    </div>
  );
}
