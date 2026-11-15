import { Injectable } from '@angular/core';
import { Permiso } from '../models/permiso';

@Injectable({ providedIn: 'root' })
export class PermisoService {
  private readonly STORAGE_PERMISOS = 'asiscorp_permisos_v2';;

 
    private permisosIniciales: Permiso[] = [
    {
      permiso_id: 1,
      usuario_id: 1, // Robin Gutierrez (Equipo Laura)
      tipo: 'MEDICO',
      fecha_inicio: '2026-11-18',
      fecha_fin: '2026-11-18',
      motivo: 'Descanso médico por faringitis aguda — Clínica Internacional (CMP 65432)',
      estado: 'PENDIENTE'
    },
    {
      permiso_id: 2,
      usuario_id: 4, // Carlos Quispe (Equipo Laura)
      tipo: 'MEDICO',
      fecha_inicio: '2026-11-19',
      fecha_fin: '2026-11-20',
      motivo: 'Extracción dental programada y reposo postoperatorio — EsSalud',
      estado: 'PENDIENTE'
    },
    {
      permiso_id: 3,
      usuario_id: 6, // Andrea Torres (Equipo Diana)
      tipo: 'MEDICO',
      fecha_inicio: '2026-11-17',
      fecha_fin: '2026-11-17',
      motivo: 'Control oftalmológico y dilatación pupilar — Instituto Nacional de Oftalmología',
      estado: 'PENDIENTE'
    },
    {
      permiso_id: 4,
      usuario_id: 1, // Robin Gutierrez (Historial aprobado)
      tipo: 'MEDICO',
      fecha_inicio: '2026-11-05',
      fecha_fin: '2026-11-05',
      motivo: 'Atención de emergencia por lumbalgia — Certificado médico adjunto',
      estado: 'APROBADO',
      observacion_rrhh: 'Certificado médico validado por Operaciones.',
      evaluado_por: 2
    },
    {
      permiso_id: 5,
      usuario_id: 2, // Laura Mendoza (Supervisor, visible para Ricardo)
      tipo: 'JUSTIFICACION',
      fecha_inicio: '2026-11-11',
      fecha_fin: '2026-11-11',
      motivo: 'Corte de fluido eléctrico en sede central impidió registrar salida a tiempo',
      estado: 'PENDIENTE'
    }
  ];

  constructor() {
    if (typeof window !== 'undefined' && !localStorage.getItem(this.STORAGE_PERMISOS)) {
      localStorage.setItem(this.STORAGE_PERMISOS, JSON.stringify(this.permisosIniciales));
    }
  }

  getPermisos(): Permiso[] {
    if (typeof window === 'undefined') return this.permisosIniciales;
    return JSON.parse(localStorage.getItem(this.STORAGE_PERMISOS) || '[]');
  }

  crearPermiso(nuevo: Permiso): void {
    const lista = this.getPermisos();
    nuevo.permiso_id = lista.length + 1;
    nuevo.estado = 'PENDIENTE';
    lista.unshift(nuevo);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_PERMISOS, JSON.stringify(lista));
    }
  }

  evaluarPermiso(permisoId: number, estado: 'APROBADO' | 'RECHAZADO', observacion: string, evaluadorId: number): void {
    const lista = this.getPermisos();
    const item = lista.find(p => p.permiso_id === permisoId);
    if (item) {
      item.estado = estado;
      item.observacion_rrhh = observacion;
      item.evaluado_por = evaluadorId;
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_PERMISOS, JSON.stringify(lista));
      }
    }
  }
}