export interface ProgramacionSemanal {
  programacion_id?: number;
  usuario_id: number;
  rango_id: number;
  fecha_inicio_semana: string;
  fecha_fin_semana: string;
  dia_descanso: number;
}