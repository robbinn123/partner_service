export type TipoPermiso = 'MEDICO' | 'PERSONAL' | 'JUSTIFICACION';
export type EstadoPermiso = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface Permiso {
  permiso_id?: number;
  usuario_id: number;
  tipo: TipoPermiso;
  fecha_inicio: string;
  fecha_fin: string;
  motivo: string;
  estado: EstadoPermiso;
  observacion_rrhh?: string | null;
  evaluado_por?: number | null;
}