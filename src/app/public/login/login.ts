import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  errorLogin = '';

  form = this.fb.group({
    correo: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  ingresar(): void {
    this.errorLogin = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { correo, password } = this.form.getRawValue();
    const user = this.authService.login(correo!, password!);

    if (!user) {
      this.errorLogin = 'Error 401: Credenciales corporativas inválidas o usuario inactivo.';
      return;
    }

    if (user.rol === 'SUPERVISOR' || user.rol === 'COORDINADOR_OPERACIONES') {
      this.router.navigate(['/panel-rrhh']);
    } else {
      this.router.navigate(['/marcacion']);
    }
  }
}