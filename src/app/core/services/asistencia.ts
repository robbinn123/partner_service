import { Injectable } from '@angular/core';
import { RangoHorario } from '../models/rango-horario';
import { ProgramacionSemanal } from '../models/programacion-semanal';
import { Asistencia } from '../models/asistencia';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
private readonly STORAGE_PROG = 'asiscorp_programacion';
  private readonly STORAGE_ASIS = 'asiscorp_asistencias_v2';

  rangosHorarios: RangoHorario[] = [
    { rango_id: 1, etiqueta: '08:30 - 17:30 (Full Time)', hora_inicio: '08:30:00', hora_fin: '17:30:00', tolerancia_minutos: 10, max_minutos_entrada: 60, max_minutos_salida: 60 },
    { rango_id: 2, etiqueta: '09:00 - 15:00 (Semi Full)', hora_inicio: '09:00:00', hora_fin: '15:00:00', tolerancia_minutos: 10, max_minutos_entrada: 60, max_minutos_salida: 60 },
    { rango_id: 3, etiqueta: '14:00 - 18:00 (Part Time)', hora_inicio: '14:00:00', hora_fin: '18:00:00', tolerancia_minutos: 5, max_minutos_entrada: 60, max_minutos_salida: 60 }
  ];

  private programacionesIniciales: ProgramacionSemanal[] = [
    { programacion_id: 1, usuario_id: 1, rango_id: 1, fecha_inicio_semana: '2026-11-16', fecha_fin_semana: '2026-11-22', dia_descanso: 7 },
    { programacion_id: 2, usuario_id: 2, rango_id: 1, fecha_inicio_semana: '2026-11-16', fecha_fin_semana: '2026-11-22', dia_descanso: 7 },
    { programacion_id: 3, usuario_id: 4, rango_id: 3, fecha_inicio_semana: '2026-11-16', fecha_fin_semana: '2026-11-22', dia_descanso: 6 }
  ];
 
    private asistenciasIniciales: Asistencia[] = [
    // Equipo de Laura Mendoza (usuario_id: 2) -> Robin (1) y Carlos (4)
    { asistencia_id: 1, usuario_id: 1, programacion_id: 1, fecha: '2026-11-12', hora_ingreso: '08:28:00', hora_salida: '17:35:00', minutos_tardanza: 0, estado: 'PUNTUAL', observacion_sistema: null },
    { asistencia_id: 2, usuario_id: 1, programacion_id: 1, fecha: '2026-11-13', hora_ingreso: '08:48:00', hora_salida: '17:32:00', minutos_tardanza: 18, estado: 'TARDANZA', observacion_sistema: null },
    { asistencia_id: 3, usuario_id: 1, programacion_id: 1, fecha: '2026-11-14', hora_ingreso: '08:25:00', hora_salida: '17:31:00', minutos_tardanza: 0, estado: 'PUNTUAL', observacion_sistema: null },
    { asistencia_id: 4, usuario_id: 4, programacion_id: 3, fecha: '2026-11-13', hora_ingreso: '14:01:00', hora_salida: '18:03:00', minutos_tardanza: 0, estado: 'PUNTUAL', observacion_sistema: null },
    { asistencia_id: 5, usuario_id: 4, programacion_id: 3, fecha: '2026-11-14', hora_ingreso: '14:02:00', hora_salida: null, minutos_tardanza: 0, estado: 'FALTA', observacion_sistema: 'No marcó salida dentro del límite permitido (1 hora)' },

    // Supervisores (visibles para Ricardo Salazar - Coordinador de Operaciones)
    { asistencia_id: 6, usuario_id: 2, programacion_id: 2, fecha: '2026-11-14', hora_ingreso: '08:20:00', hora_salida: '17:40:00', minutos_tardanza: 0, estado: 'PUNTUAL', observacion_sistema: null },
    { asistencia_id: 7, usuario_id: 5, programacion_id: 2, fecha: '2026-11-14', hora_ingreso: '08:45:00', hora_salida: '17:30:00', minutos_tardanza: 15, estado: 'TARDANZA', observacion_sistema: null },

    // Equipo de Diana Paredes (usuario_id: 5) -> Andrea Torres (6)
    { asistencia_id: 8, usuario_id: 6, programacion_id: 3, fecha: '2026-11-13', hora_ingreso: '09:04:00', hora_salida: '15:02:00', minutos_tardanza: 0, estado: 'PUNTUAL', observacion_sistema: null },
    { asistencia_id: 9, usuario_id: 6, programacion_id: 3, fecha: '2026-11-14', hora_ingreso: null, hora_salida: null, minutos_tardanza: 0, estado: 'FALTA', observacion_sistema: 'No registró ingreso dentro del límite permitido (1 hora)' }
  
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.STORAGE_PROG)) {
        localStorage.setItem(this.STORAGE_PROG, JSON.stringify(this.programacionesIniciales));
      }
      if (!localStorage.getItem(this.STORAGE_ASIS)) {
        localStorage.setItem(this.STORAGE_ASIS, JSON.stringify(this.asistenciasIniciales));
      }
      const fechaHoy = new Date().toISOString().split('T')[0];
      this.auditarCierreDelDia(fechaHoy);
    }
  }

  getProgramaciones(): ProgramacionSemanal[] {
    if (typeof window === 'undefined') return this.programacionesIniciales;
    return JSON.parse(localStorage.getItem(this.STORAGE_PROG) || '[]');
  }

  getProgramacionUsuario(usuarioId: number, fechaConsulta?: string): { prog: ProgramacionSemanal; rango: RangoHorario } {
    const progs = this.getProgramaciones().filter(p => p.usuario_id === usuarioId);
    const fecha = fechaConsulta || new Date().toISOString().split('T')[0];

    // 1. Busca la programación cuya semana incluya la fecha actual/consultada
    // 2. Si aún no inicia la semana, toma la última programación asignada a ese usuario
    const prog =
      progs.find(p => fecha >= p.fecha_inicio_semana && fecha <= p.fecha_fin_semana) ||
      progs[progs.length - 1] || {
        programacion_id: 99,
        usuario_id: usuarioId,
        rango_id: 1,
        fecha_inicio_semana: '2026-11-16',
        fecha_fin_semana: '2026-11-22',
        dia_descanso: 7
      };

    const rango = this.rangosHorarios.find(r => r.rango_id === prog.rango_id) || this.rangosHorarios[0];
    return { prog, rango };
  }

  asignarProgramacion(nueva: ProgramacionSemanal): void {
    const lista = this.getProgramaciones();
    const idx = lista.findIndex(
      p => p.usuario_id === nueva.usuario_id && p.fecha_inicio_semana === nueva.fecha_inicio_semana
    );

    if (idx >= 0) {
      lista[idx] = { ...lista[idx], ...nueva };
    } else {
      nueva.programacion_id = lista.length + 1;
      lista.push(nueva);
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_PROG, JSON.stringify(lista));
    }
  }

  getAsistencias(): Asistencia[] {
    if (typeof window === 'undefined') return this.asistenciasIniciales;
    return JSON.parse(localStorage.getItem(this.STORAGE_ASIS) || '[]');
  }

  registrarMarcacion(asistencia: Asistencia): void {
    const lista = this.getAsistencias();
    const idx = lista.findIndex(a => a.usuario_id === asistencia.usuario_id && a.fecha === asistencia.fecha);
    if (idx >= 0) {
      lista[idx] = asistencia;
    } else {
      asistencia.asistencia_id = lista.length + 1;
      lista.unshift(asistencia);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_ASIS, JSON.stringify(lista));
    }
  }

  auditarCierreDelDia(fechaHoy: string): number {
    const lista = this.getAsistencias();
    let faltasGeneradas = 0;
    lista.forEach(a => {
      if (a.fecha === fechaHoy && a.hora_ingreso && !a.hora_salida && a.estado !== 'FALTA') {
        a.estado = 'FALTA';
        a.observacion_sistema = 'No marcó salida dentro del límite permitido (1 hora)';
        faltasGeneradas++;
      }
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_ASIS, JSON.stringify(lista));
    }
    return faltasGeneradas;
  }
}