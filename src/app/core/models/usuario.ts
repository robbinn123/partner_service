export type RolUsuario = 'ASESOR' | 'SUPERVISOR' | 'COORDINADOR_OPERACIONES';
export type TipoJornada = 'FULL_TIME' | 'PART_TIME' | 'SEMI_FULL';

export interface Usuario {
  usuario_id?: number;
  dni: string;
  nombres: string;
  apellidos: string;
  correo: string;
  password?: string;
  area: string;
  rol: RolUsuario;
  tipo_jornada: TipoJornada;
  supervisor_id?: number;
  acepto_ley_datos: boolean;
  activo?: boolean;
}