import { Routes } from '@angular/router';
import { Login } from './public/login/login';
import { Registro } from './public/registro/registro';
import { Marcacion } from './private/marcacion/marcacion';
import { MiAsistencia } from './private/mi-asistencia/mi-asistencia';
import { Permisos } from './private/permisos/permisos';
import { PanelRrhh } from './private/panel-rrhh/panel-rrhh';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'registro', component: Registro },
  { path: 'marcacion', component: Marcacion },
  { path: 'mi-asistencia', component: MiAsistencia },
  { path: 'permisos', component: Permisos },
  { path: 'panel-rrhh', component: PanelRrhh },
  { path: '**', redirectTo: 'login' }
];