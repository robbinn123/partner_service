import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { AsistenciaService } from '../../core/services/asistencia';
import { Asistencia } from '../../core/models/asistencia';

@Component({
  selector: 'app-mi-asistencia',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mi-asistencia.html'
})
export class MiAsistencia implements OnInit {
  private authService = inject(AuthService);
  private asistenciaService = inject(AsistenciaService);

  misRegistros: Asistencia[] = [];
  filtroEstado = 'TODOS';

  ngOnInit(): void {
    const user = this.authService.getUsuarioActual() || this.authService.getUsuarios()[0];
    this.misRegistros = this.asistenciaService
      .getAsistencias()
      .filter(a => a.usuario_id === user.usuario_id);
  }

  get registrosFiltrados(): Asistencia[] {
    if (this.filtroEstado === 'TODOS') return this.misRegistros;
    return this.misRegistros.filter(r => r.estado === this.filtroEstado);
  }

  get totalPuntuales(): number {
    return this.misRegistros.filter(r => r.estado === 'PUNTUAL').length;
  }

  get totalTardanzas(): number {
    return this.misRegistros.filter(r => r.estado === 'TARDANZA').length;
  }

  get totalFaltas(): number {
    return this.misRegistros.filter(r => r.estado === 'FALTA').length;
  }

  get minutosTardanzaAcumulados(): number {
    return this.misRegistros.reduce((acc, r) => acc + (r.minutos_tardanza || 0), 0);
  }
}