import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { TipoJornada } from '../../core/models/usuario';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html'
})
export class Registro {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  mensajeError = '';
  mensajeExito = '';

  form = this.fb.group({
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    nombres: ['', [Validators.required, Validators.minLength(2)]],
    apellidos: ['', [Validators.required, Validators.minLength(2)]],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    area: ['Sistemas', Validators.required],
    tipo_jornada: ['FULL_TIME' as TipoJornada, Validators.required],
    acepto_ley_datos: [false, Validators.requiredTrue]
  });

  registrar(): void {
    this.mensajeError = '';
    this.mensajeExito = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const val = this.form.getRawValue();
    const res = this.authService.registrar({
      dni: val.dni!,
      nombres: val.nombres!,
      apellidos: val.apellidos!,
      correo: val.correo!,
      password: val.password!,
      area: val.area!,
      rol: 'ASESOR',
      tipo_jornada: val.tipo_jornada as TipoJornada,
      acepto_ley_datos: val.acepto_ley_datos!
    });

    if (!res.ok) {
      this.mensajeError = res.mensaje;
      return;
    }

    this.mensajeExito = 'Registro exitoso. Redirigiendo al login...';
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }
}