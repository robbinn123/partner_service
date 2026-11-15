import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { AsistenciaService } from '../../core/services/asistencia';
import { Usuario } from '../../core/models/usuario';
import { RangoHorario } from '../../core/models/rango-horario';
import { ProgramacionSemanal } from '../../core/models/programacion-semanal';
import { Asistencia } from '../../core/models/asistencia';

@Component({
  selector: 'app-marcacion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './marcacion.html'
})
export class Marcacion implements OnInit {
  private authService = inject(AuthService);
  private asistenciaService = inject(AsistenciaService);

  usuario!: Usuario;
  rango!: RangoHorario;
  prog!: ProgramacionSemanal;
  asistenciaHoy?: Asistencia;

  fechaHoy = new Date().toISOString().split('T')[0];
  horaSimulada = '08:32';
  mensajeAlerta = '';
  tipoAlerta: 'success' | 'warning' | 'danger' = 'success';

  diasSemana = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  ngOnInit(): void {
    this.usuario = this.authService.getUsuarioActual() || this.authService.getUsuarios()[0];
    const info = this.asistenciaService.getProgramacionUsuario(this.usuario.usuario_id!);
    this.prog = info.prog;
    this.rango = info.rango;
    this.cargarAsistenciaHoy();
  }

  cargarAsistenciaHoy(): void {
    this.asistenciaHoy = this.asistenciaService
      .getAsistencias()
      .find(a => a.usuario_id === this.usuario.usuario_id && a.fecha === this.fechaHoy);
  }

  get esDiaDescanso(): boolean {
    const diaActual = new Date().getDay() === 0 ? 7 : new Date().getDay();
    return this.prog.dia_descanso === diaActual;
  }

  private aMinutos(hora: string): number {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  get entradaExcedidaMasDeUnaHora(): boolean {
    return this.aMinutos(this.horaSimulada) > this.aMinutos(this.rango.hora_inicio) + this.rango.max_minutos_entrada;
  }

  get salidaExcedidaMasDeUnaHora(): boolean {
    return this.aMinutos(this.horaSimulada) > this.aMinutos(this.rango.hora_fin) + this.rango.max_minutos_salida;
  }

  marcarIngreso(): void {
    if (this.esDiaDescanso) {
      this.mostrarMensaje('Hoy es tu día de descanso programado. Marcación bloqueada.', 'warning');
      return;
    }
    if (this.entradaExcedidaMasDeUnaHora) {
      const falta: Asistencia = {
        usuario_id: this.usuario.usuario_id!,
        programacion_id: this.prog.programacion_id!,
        fecha: this.fechaHoy,
        hora_ingreso: null,
        hora_salida: null,
        minutos_tardanza: 0,
        estado: 'FALTA',
        observacion_sistema: 'Superó el límite máximo de +1 hora para registrar entrada.'
      };
      this.asistenciaService.registrarMarcacion(falta);
      this.cargarAsistenciaHoy();
      this.mostrarMensaje('Límite de +1 hora superado. Se ha registrado como FALTA automática.', 'danger');
      return;
    }

    const diff = this.aMinutos(this.horaSimulada) - this.aMinutos(this.rango.hora_inicio);
    const esTardanza = diff > this.rango.tolerancia_minutos;

    const nueva: Asistencia = {
      usuario_id: this.usuario.usuario_id!,
      programacion_id: this.prog.programacion_id!,
      fecha: this.fechaHoy,
      hora_ingreso: `${this.horaSimulada}:00`,
      hora_salida: null,
      minutos_tardanza: esTardanza ? diff : 0,
      estado: esTardanza ? 'TARDANZA' : 'PUNTUAL',
      observacion_sistema: null
    };

    this.asistenciaService.registrarMarcacion(nueva);
    this.cargarAsistenciaHoy();
    this.mostrarMensaje(
      esTardanza ? `Ingreso registrado con TARDANZA (${diff} min).` : 'Ingreso PUNTUAL registrado correctamente.',
      esTardanza ? 'warning' : 'success'
    );
  }

  marcarSalida(): void {
    if (!this.asistenciaHoy || !this.asistenciaHoy.hora_ingreso) return;

    if (this.salidaExcedidaMasDeUnaHora) {
      this.asistenciaHoy.estado = 'FALTA';
      this.asistenciaHoy.observacion_sistema = 'No marcó salida dentro del límite permitido (1 hora)';
      this.asistenciaService.registrarMarcacion(this.asistenciaHoy);
      this.cargarAsistenciaHoy();
      this.mostrarMensaje('Excediste +1 hora después de tu horario de salida. Se considera FALTA.', 'danger');
      return;
    }

    this.asistenciaHoy.hora_salida = `${this.horaSimulada}:00`;
    this.asistenciaService.registrarMarcacion(this.asistenciaHoy);
    this.cargarAsistenciaHoy();
    this.mostrarMensaje('Hora de salida registrada correctamente. ¡Buen descanso!', 'success');
  }

  private mostrarMensaje(texto: string, tipo: 'success' | 'warning' | 'danger'): void {
    this.mensajeAlerta = texto;
    this.tipoAlerta = tipo;
  }
}