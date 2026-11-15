import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { AsistenciaService } from '../../core/services/asistencia';
import { PermisoService } from '../../core/services/permiso';
import { Usuario } from '../../core/models/usuario';
import { Asistencia } from '../../core/models/asistencia';
import { Permiso } from '../../core/models/permiso';

@Component({
  selector: 'app-panel-rrhh',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './panel-rrhh.html'
})
export class PanelRrhh implements OnInit {
  private authService = inject(AuthService);
  asistenciaService = inject(AsistenciaService);
  private permisoService = inject(PermisoService);

  pestanaActiva: 'REPORTE' | 'PROGRAMACION' | 'PERMISOS' | 'INDICADORES' = 'REPORTE';

  usuarioSesion: Usuario | null = null;
  usuarios: Usuario[] = [];
  asistencias: Asistencia[] = [];
  permisos: Permiso[] = [];

  filtroArea = 'TODAS';
  filtroJornada = 'TODAS';
  mensajeRRHH = '';

  // Segmentadores de la pestaña 4 (Control e Indicadores)
  filtroIndSupervisorId = 'TODOS';
  filtroIndAsesorId = 'TODOS';

  progUsuarioId = 1;
  progRangoId = 1;
  progInicioSemana = '2026-11-23';
  progFinSemana = '2026-11-29';
  progDiaDescanso = 7;

  observaciones: { [permisoId: number]: string } = {};

  ngOnInit(): void {
    this.usuarioSesion = this.authService.getUsuarioActual();
    const fechaHoy = new Date().toISOString().split('T')[0];
    this.asistenciaService.auditarCierreDelDia(fechaHoy);
    this.refrescarDatos();

    if (this.usuarioSesion?.rol === 'SUPERVISOR' && this.usuarioSesion.usuario_id) {
      this.filtroIndSupervisorId = String(this.usuarioSesion.usuario_id);
    }

    if (this.usuariosGestionables.length > 0 && this.usuariosGestionables[0].usuario_id) {
      this.progUsuarioId = this.usuariosGestionables[0].usuario_id;
    }
  }

  refrescarDatos(): void {
    this.usuarios = this.authService.getUsuarios();
    this.asistencias = this.asistenciaService.getAsistencias();
    this.permisos = this.permisoService.getPermisos();
  }

  obtenerUsuario(id: number): Usuario | undefined {
    return this.usuarios.find(u => u.usuario_id === id);
  }

  get usuariosGestionables(): Usuario[] {
    if (!this.usuarioSesion) return [];
    if (this.usuarioSesion.rol === 'SUPERVISOR') {
      return this.usuarios.filter(
        u => u.rol === 'ASESOR' && u.supervisor_id === this.usuarioSesion!.usuario_id
      );
    }
    return this.usuarios.filter(u => u.rol !== 'COORDINADOR_OPERACIONES');
  }

  get asistenciasFiltradas(): Asistencia[] {
    const idsPermitidos = new Set(this.usuariosGestionables.map(u => u.usuario_id));
    return this.asistencias.filter(a => {
      if (!idsPermitidos.has(a.usuario_id)) return false;
      const u = this.obtenerUsuario(a.usuario_id);
      if (!u) return false;
      const coincideArea = this.filtroArea === 'TODAS' || u.area === this.filtroArea;
      const coincideJornada = this.filtroJornada === 'TODAS' || u.tipo_jornada === this.filtroJornada;
      return coincideArea && coincideJornada;
    });
  }

  get permisosFiltrados(): Permiso[] {
    const idsPermitidos = new Set(this.usuariosGestionables.map(u => u.usuario_id));
    return this.permisos.filter(p => idsPermitidos.has(p.usuario_id));
  }

  // --- Lógica de Segmentadores e Indicadores ---

  get listaSupervisoresDisponibles(): Usuario[] {
    if (this.usuarioSesion?.rol === 'SUPERVISOR') {
      return this.usuarios.filter(u => u.usuario_id === this.usuarioSesion!.usuario_id);
    }
    return this.usuarios.filter(u => u.rol === 'SUPERVISOR');
  }

  get listaAsesoresDisponibles(): Usuario[] {
    let asesores = this.usuarios.filter(u => u.rol === 'ASESOR');
    if (this.usuarioSesion?.rol === 'SUPERVISOR') {
      asesores = asesores.filter(u => u.supervisor_id === this.usuarioSesion!.usuario_id);
    } else if (this.filtroIndSupervisorId !== 'TODOS') {
      asesores = asesores.filter(u => u.supervisor_id === Number(this.filtroIndSupervisorId));
    }
    return asesores;
  }

  onCambioSupervisorIndicador(): void {
    this.filtroIndAsesorId = 'TODOS';
  }

  private calcularMetricasUsuarios(listaUsuarios: Usuario[]) {
    const ids = new Set(listaUsuarios.map(u => u.usuario_id));
    const regs = this.asistencias.filter(a => ids.has(a.usuario_id));
    const perms = this.permisos.filter(p => ids.has(p.usuario_id) && p.estado === 'APROBADO');

    const total = regs.length;
    const puntuales = regs.filter(a => a.estado === 'PUNTUAL').length;
    const tardanzas = regs.filter(a => a.estado === 'TARDANZA').length;
    const faltas = regs.filter(a => a.estado === 'FALTA').length;
    const minutosTardanza = regs.reduce((acc, a) => acc + (a.minutos_tardanza || 0), 0);
    const porcentajePuntualidad = total > 0 ? Math.round((puntuales / total) * 100) : 0;

    const detalle = listaUsuarios.map(u => {
      const rUser = regs.filter(a => a.usuario_id === u.usuario_id);
      const pUser = perms.filter(p => p.usuario_id === u.usuario_id).length;
      const punt = rUser.filter(a => a.estado === 'PUNTUAL').length;
      const tard = rUser.filter(a => a.estado === 'TARDANZA').length;
      const falt = rUser.filter(a => a.estado === 'FALTA').length;
      const mins = rUser.reduce((acc, a) => acc + (a.minutos_tardanza || 0), 0);
      const tot = rUser.length;
      const efectividad = tot > 0 ? Math.round(((punt + tard) / tot) * 100) : 100;

      const hrs = Math.floor(mins / 60).toString().padStart(2, '0');
      const minRest = (mins % 60).toString().padStart(2, '0');

      return {
        usuario: u,
        puntuales: punt,
        tardanzas: tard,
        faltas: falt,
        minutosTardanza: mins,
        tiempoDeuda: `${hrs}:${minRest}`,
        permisosAprobados: pUser,
        efectividad
      };
    });

    return {
      kpis: {
        total,
        puntuales,
        tardanzas,
        faltas,
        minutosTardanza,
        permisosAprobados: perms.length,
        porcentajePuntualidad
      },
      detalle
    };
  }

  get indicadoresSupervisores() {
    let sups = this.listaSupervisoresDisponibles;
    if (this.filtroIndSupervisorId !== 'TODOS') {
      sups = sups.filter(u => u.usuario_id === Number(this.filtroIndSupervisorId));
    }
    return this.calcularMetricasUsuarios(sups);
  }

  get indicadoresAsesores() {
    let asesores = this.listaAsesoresDisponibles;
    if (this.filtroIndAsesorId !== 'TODOS') {
      asesores = asesores.filter(u => u.usuario_id === Number(this.filtroIndAsesorId));
    }
    return this.calcularMetricasUsuarios(asesores);
  }
descargarIndicadoresCSV(): void {
    const encabezados = 'Rol;DNI;Colaborador;Area;Modalidad;Supervisor;Puntuales;Tardanzas;Minutos_Tardanza;Faltas;Permisos_Aprobados;Porcentaje_Asistencia\n';

    const filasSup = this.usuarioSesion?.rol === 'COORDINADOR_OPERACIONES'
      ? this.indicadoresSupervisores.detalle.map(item => {
          const u = item.usuario;
          return `${u.rol};${u.dni};${u.nombres} ${u.apellidos};${u.area};${u.tipo_jornada};N/A;${item.puntuales};${item.tardanzas};${item.minutosTardanza};${item.faltas};${item.permisosAprobados};${item.efectividad}%`;
        })
      : [];

    const filasAse = this.indicadoresAsesores.detalle.map(item => {
      const u = item.usuario;
      const sup = u.supervisor_id ? this.obtenerUsuario(u.supervisor_id) : undefined;
      const nombreSup = sup ? `${sup.nombres} ${sup.apellidos}` : 'Sin asignar';
      return `${u.rol};${u.dni};${u.nombres} ${u.apellidos};${u.area};${u.tipo_jornada};${nombreSup};${item.puntuales};${item.tardanzas};${item.minutosTardanza};${item.faltas};${item.permisosAprobados};${item.efectividad}%`;
    });

    const contenido = '\uFEFF' + encabezados + [...filasSup, ...filasAse].join('\n');
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fechaHoy = new Date().toISOString().split('T')[0];
    link.download = `indicadores_asistencia_${fechaHoy}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
  // --- Programación Semanal y Permisos ---

  guardarProgramacion(): void {
    const inicio = new Date(this.progInicioSemana + 'T00:00:00');
    const fin = new Date(inicio);
    fin.setDate(inicio.getDate() + 6);
    this.progFinSemana = fin.toISOString().split('T')[0];

    this.asistenciaService.asignarProgramacion({
      usuario_id: Number(this.progUsuarioId),
      rango_id: Number(this.progRangoId),
      fecha_inicio_semana: this.progInicioSemana,
      fecha_fin_semana: this.progFinSemana,
      dia_descanso: Number(this.progDiaDescanso)
    });
    this.mensajeRRHH = 'Programación semanal y día de descanso actualizados correctamente.';
  }

  descargarPlantillaCSV(): void {
    const encabezados = 'dni,inicio_semana,rango_id,dia_descanso\n';
    const filas = this.usuariosGestionables
      .map(u => `${u.dni},${this.progInicioSemana || '2026-11-23'},1,7`)
      .join('\n');

    const contenido = encabezados + filas;
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'plantilla_programacion_semanal.csv';
    link.click();
    URL.revokeObjectURL(url);
  }

  cargarProgramacionMasiva(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const texto = (reader.result as string || '').trim();
      const lineas = texto.split(/\r?\n/).filter(l => l.trim() !== '');

      if (lineas.length <= 1) {
        this.mensajeRRHH = 'El archivo CSV está vacío o solo contiene encabezados.';
        return;
      }

      const separador = lineas[0].includes(';') ? ';' : ',';
      let cargados = 0;
      const errores: string[] = [];

      for (let i = 1; i < lineas.length; i++) {
        const cols = lineas[i].split(separador).map(c => c.trim());
        if (cols.length < 4) {
          errores.push(`Fila ${i + 1}: columnas incompletas.`);
          continue;
        }

        const [dni, inicioSemana, rangoStr, descansoStr] = cols;
        const usuario = this.usuariosGestionables.find(u => u.dni === dni);

        if (!usuario || !usuario.usuario_id) {
          errores.push(`Fila ${i + 1}: DNI ${dni} no pertenece a tu equipo o no es programable.`);
          continue;
        }

        const rangoId = Number(rangoStr);
        const diaDescanso = Number(descansoStr);
        const rangoValido = this.asistenciaService.rangosHorarios.some(r => r.rango_id === rangoId);

        if (!rangoValido || diaDescanso < 1 || diaDescanso > 7 || !inicioSemana) {
          errores.push(`Fila ${i + 1} (${usuario.nombres}): datos inválidos.`);
          continue;
        }

        const inicio = new Date(inicioSemana + 'T00:00:00');
        const fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6);
        const finSemana = fin.toISOString().split('T')[0];

        this.asistenciaService.asignarProgramacion({
          usuario_id: usuario.usuario_id,
          rango_id: rangoId,
          fecha_inicio_semana: inicioSemana,
          fecha_fin_semana: finSemana,
          dia_descanso: diaDescanso
        });
        cargados++;
      }

      this.mensajeRRHH = errores.length > 0
        ? `Carga masiva completada: ${cargados} turnos asignados. Observaciones: ${errores.join(' | ')}`
        : `Carga masiva exitosa: se asignaron ${cargados} turnos semanales.`;

      input.value = '';
    };

    reader.readAsText(archivo, 'UTF-8');
  }

  decidirPermiso(permisoId: number, decision: 'APROBADO' | 'RECHAZADO'): void {
    const obs = (this.observaciones[permisoId] || '').trim();
    if (decision === 'RECHAZADO' && !obs) {
      this.mensajeRRHH = 'Error: Para rechazar un permiso es obligatorio escribir una observación.';
      return;
    }
    const evaluadorId = this.usuarioSesion?.usuario_id || 2;
    this.permisoService.evaluarPermiso(permisoId, decision, obs || 'Aprobado por Operaciones.', evaluadorId);
    this.refrescarDatos();
    this.mensajeRRHH = `Solicitud #${permisoId} marcada como ${decision}.`;
  }
}
