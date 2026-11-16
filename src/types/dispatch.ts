export type TipoServicio = '' | 'Urgencia' | 'Alta' | 'Interhospitalario';

export const PROVINCIAS_CYL = [
  'Ávila',
  'Burgos',
  'León',
  'Palencia',
  'Salamanca',
  'Segovia',
  'Soria',
  'Valladolid',
  'Zamora',
] as const;

export const TIPOS_SERVICIO: Exclude<TipoServicio, ''>[] = [
  'Urgencia',
  'Alta',
  'Interhospitalario',
];

export interface DispatchData {
  fecha: string; // YYYY-MM-DD internally, formatted DD/MM/YYYY for display & WhatsApp
  provincia: string;
  asegurado: string;
  dni: string;
  poliza: string;
  autorizacion: string;
  tipo: TipoServicio;
  origen: string;
  destino: string;
  horaLlamada: string;
  horaAsistencia: string;
  horaDestino: string;
  telefono: string;
  anotaciones: string;
}

export interface SavedDispatch {
  id: string;
  updatedAt: number;
  data: DispatchData;
}

export const EMPTY_DISPATCH: DispatchData = {
  fecha: '',
  provincia: '',
  asegurado: '',
  dni: '',
  poliza: '',
  autorizacion: '',
  tipo: '',
  origen: '',
  destino: '',
  horaLlamada: '',
  horaAsistencia: '',
  horaDestino: '',
  telefono: '',
  anotaciones: '',
};

export function formatDisplayDate(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getCurrentTimeHHMM(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function computeDniLetter(value: string): string | null {
  const clean = value.trim();
  if (!/^\d{8}$/.test(clean)) return null;
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
  return letters[Number(clean) % 23];
}

export function hasAnyFilledContent(data: DispatchData): boolean {
  return Object.values(data).some((v) => v.trim().length > 0);
}

/**
 * Generates the WhatsApp-formatted message.
 * - Titles are uppercase and wrapped in *...* so WhatsApp renders them in bold.
 * - Only filled fields are included, EXCEPT HORA DE LLAMADA, HORA ASISTENCIA,
 *   and HORA DESTINO, which are ALWAYS included whether filled or empty.
 */
export function formatWhatsAppMessage(data: DispatchData): string {
  const lines: string[] = [];

  if (data.fecha.trim()) {
    lines.push(`*FECHA:* ${formatDisplayDate(data.fecha.trim())}`);
  }
  if (data.provincia.trim()) {
    lines.push(`*PROVINCIA:* ${data.provincia.trim()}`);
  }
  if (data.asegurado.trim()) {
    lines.push(`*ASEGURADO:* ${data.asegurado.trim()}`);
  }
  if (data.dni.trim()) {
    lines.push(`*DNI:* ${data.dni.trim()}`);
  }
  if (data.poliza.trim()) {
    lines.push(`*Nº PÓLIZA:* ${data.poliza.trim()}`);
  }
  if (data.autorizacion.trim()) {
    lines.push(`*Nº AUTORIZACION:* ${data.autorizacion.trim()}`);
  }
  if (data.tipo.trim()) {
    lines.push(`*TIPO:* ${data.tipo.trim()}`);
  }
  if (data.origen.trim()) {
    lines.push(`*ORIGEN:* ${data.origen.trim()}`);
  }
  if (data.destino.trim()) {
    lines.push(`*DESTINO:* ${data.destino.trim()}`);
  }

  // Always included (whether filled or empty)
  lines.push(`*HORA DE LLAMADA:*${data.horaLlamada.trim() ? ` ${data.horaLlamada.trim()}` : ''}`);
  lines.push(`*HORA ASISTENCIA:*${data.horaAsistencia.trim() ? ` ${data.horaAsistencia.trim()}` : ''}`);
  lines.push(`*HORA DESTINO:*${data.horaDestino.trim() ? ` ${data.horaDestino.trim()}` : ''}`);

  if (data.telefono.trim()) {
    lines.push(`*TELEFONO:* ${data.telefono.trim()}`);
  }
  if (data.anotaciones.trim()) {
    lines.push(`*ANOTACIONES:* ${data.anotaciones.trim()}`);
  }

  return lines.join('\n');
}
