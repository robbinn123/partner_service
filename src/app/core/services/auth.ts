import { Injectable, signal } from '@angular/core';
import { Usuario } from '../models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly STORAGE_USERS = 'asiscorp_usuarios_v4';
  private readonly STORAGE_SESSION = 'asiscorp_sesion';

  usuarioActual = signal<Usuario | null>(null);

  private usuariosIniciales: Usuario[] = [
    {
      usuario_id: 1,
      dni: '72345678',
      nombres: 'Robin',
      apellidos: 'Gutierrez',
      correo: 'robin.asesor@asiscorp.pe',
      password: '123456',
      area: 'Operaciones',
      rol: 'ASESOR',
      tipo_jornada: 'FULL_TIME',
      supervisor_id: 2,
      acepto_ley_datos: true,
      activo: true
    },
    {
      usuario_id: 2,
      dni: '45678912',
      nombres: 'Laura',
      apellidos: 'Mendoza',
      correo: 'laura.supervisor@asiscorp.pe',
      password: '123456',
      area: 'Operaciones',
      rol: 'SUPERVISOR',
      tipo_jornada: 'FULL_TIME',
      acepto_ley_datos: true,
      activo: true
    },
    {
      usuario_id: 3,
      dni: '41234567',
      nombres: 'Ricardo',
      apellidos: 'Salazar',
      correo: 'ricardo.coordinador@asiscorp.pe',
      password: '123456',
      area: 'Operaciones',
      rol: 'COORDINADOR_OPERACIONES',
      tipo_jornada: 'FULL_TIME',
      acepto_ley_datos: true,
      activo: true
    },
    {
      usuario_id: 4,
      dni: '71234569',
      nombres: 'Carlos',
      apellidos: 'Quispe',
      correo: 'carlos.quispe@asiscorp.pe',
      password: '123456',
      area: 'Operaciones',
      rol: 'ASESOR',
      tipo_jornada: 'PART_TIME',
      supervisor_id: 2,
      acepto_ley_datos: true,
      activo: true
    },
    {
      usuario_id: 5,
      dni: '43987654',
      nombres: 'Diana',
      apellidos: 'Paredes',
      correo: 'diana.supervisor@asiscorp.pe',
      password: '123456',
      area: 'Atención al Cliente',
      rol: 'SUPERVISOR',
      tipo_jornada: 'FULL_TIME',
      acepto_ley_datos: true,
      activo: true
    },
    {
      usuario_id: 6,
      dni: '74561238',
      nombres: 'Andrea',
      apellidos: 'Torres',
      correo: 'andrea.torres@asiscorp.pe',
      password: '123456',
      area: 'Atención al Cliente',
      rol: 'ASESOR',
      tipo_jornada: 'SEMI_FULL',
      supervisor_id: 5,
      acepto_ley_datos: true,
      activo: true
    }
  ];

  constructor() {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem(this.STORAGE_USERS)) {
        localStorage.setItem(this.STORAGE_USERS, JSON.stringify(this.usuariosIniciales));
      }
      const sesionGuardada = localStorage.getItem(this.STORAGE_SESSION);
      if (sesionGuardada) {
        this.usuarioActual.set(JSON.parse(sesionGuardada));
      }
    }
  }

  getUsuarios(): Usuario[] {
    if (typeof window === 'undefined') return this.usuariosIniciales;
    return JSON.parse(localStorage.getItem(this.STORAGE_USERS) || '[]');
  }

  login(correo: string, password: string): Usuario | null {
    const user = this.getUsuarios().find(
      u => u.correo.toLowerCase() === correo.toLowerCase() && u.password === password && u.activo
    );
    if (user) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_SESSION, JSON.stringify(user));
      }
      this.usuarioActual.set(user);
      return user;
    }
    return null;
  }

  registrar(nuevo: Usuario): { ok: boolean; mensaje: string } {
    const lista = this.getUsuarios();
    if (lista.some(u => u.dni === nuevo.dni)) {
      return { ok: false, mensaje: 'El DNI ingresado ya se encuentra registrado.' };
    }
    if (lista.some(u => u.correo.toLowerCase() === nuevo.correo.toLowerCase())) {
      return { ok: false, mensaje: 'El correo corporativo ya está registrado.' };
    }
    nuevo.usuario_id = lista.length + 1;
    nuevo.rol = 'ASESOR';
    nuevo.supervisor_id = nuevo.supervisor_id || 2;
    nuevo.activo = true;
    lista.push(nuevo);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_USERS, JSON.stringify(lista));
    }
    return { ok: true, mensaje: 'Asesor registrado correctamente.' };
  }

  getUsuarioActual(): Usuario | null {
    if (this.usuarioActual()) return this.usuarioActual();
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(this.STORAGE_SESSION);
      if (data) {
        const parsed = JSON.parse(data);
        this.usuarioActual.set(parsed);
        return parsed;
      }
    }
    return null;
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_SESSION);
    }
    this.usuarioActual.set(null);
  }
}