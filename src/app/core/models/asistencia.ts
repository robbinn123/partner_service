export type EstadoAsistencia = 'PUNTUAL' | 'TARDANZA' | 'FALTA' | 'DESCANSO';

export interface Asistencia {
  asistencia_id?: number;
  usuario_id: number;
  programacion_id: number;
  fecha: string;
  hora_ingreso: string | null;
  hora_salida: string | null;
  minutos_tardanza: number;
  estado: EstadoAsistencia;
  observacion_sistema?: string | null;
}