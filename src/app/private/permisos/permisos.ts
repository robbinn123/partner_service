import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth';
import { PermisoService } from '../../core/services/permiso';
import { Permiso, TipoPermiso } from '../../core/models/permiso';

@Component({
  selector: 'app-permisos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './permisos.html'
})
export class Permisos implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private permisoService = inject(PermisoService);

  usuarioId = 1;
  misPermisos: Permiso[] = [];
  mensajeExito = '';

  form = this.fb.group(
    {
      tipo: ['JUSTIFICACION' as TipoPermiso, Validators.required],
      fecha_inicio: ['', Validators.required],
      fecha_fin: ['', Validators.required],
      motivo: ['', [Validators.required, Validators.minLength(10)]]
    },
    { validators: this.validarRangoFechas }
  );

  ngOnInit(): void {
    const user = this.authService.getUsuarioActual() || this.authService.getUsuarios()[0];
    this.usuarioId = user.usuario_id!;
    this.cargarPermisos();
  }

  validarRangoFechas(group: AbstractControl): ValidationErrors | null {
    const inicio = group.get('fecha_inicio')?.value;
    const fin = group.get('fecha_fin')?.value;
    if (inicio && fin && fin < inicio) {
      return { rangoInvalido: true };
    }
    return null;
  }

  cargarPermisos(): void {
    this.misPermisos = this.permisoService
      .getPermisos()
      .filter(p => p.usuario_id === this.usuarioId);
  }

  enviarSolicitud(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    this.permisoService.crearPermiso({
      usuario_id: this.usuarioId,
      tipo: val.tipo as TipoPermiso,
      fecha_inicio: val.fecha_inicio!,
      fecha_fin: val.fecha_fin!,
      motivo: val.motivo!,
      estado: 'PENDIENTE'
    });

    this.form.reset({ tipo: 'JUSTIFICACION', fecha_inicio: '', fecha_fin: '', motivo: '' });
    this.cargarPermisos();
    this.mensajeExito = 'Solicitud enviada correctamente a Recursos Humanos.';
  }
}