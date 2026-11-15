export interface RangoHorario {
  rango_id: number;
  etiqueta: string;
  hora_inicio: string;
  hora_fin: string;
  tolerancia_minutos: number;
  max_minutos_entrada: number;
  max_minutos_salida: number;
}