# Partner Service — Sistema Web de Control de Asistencia y Programación Horaria

Aplicación web corporativa desarrollada en **Angular 22** para unificar el control de asistencia, gestión jerárquica de permisos, programación semanal rotativa (individual y carga masiva CSV) y analítica de indicadores operativos (KPIs) en **Partner Service**.

## Roles del Sistema
- **Asesor (`ASESOR`):** Marcación diaria de entrada/salida, consulta de turno semanal, historial personal y solicitud de permisos/justificaciones.
- **Supervisor (`SUPERVISOR`):** Gestión y evaluación de permisos de su equipo, programación semanal rotativa (individual/CSV) y monitoreo de indicadores.
- **Coordinador de Operaciones (`COORDINADOR_OPERACIONES`):** Visibilidad global de la operación, gestión transversal y exportación de métricas a CSV/Excel.

## Requisitos
- **Node.js** `22.22.3` o superior (también `24.15+` o `26+`), requerido por Angular 22.
- **npm** (incluido con Node.js).

## Ejecución Local
1. Clonar el repositorio y entrar a la carpeta:
   ```bash
   git clone https://github.com/robbinn123/partner_service.git
   cd partner_service
   ```
2. Instalar dependencias: `npm install`
3. Iniciar servidor de desarrollo: `npm start`
4. Abrir en el navegador: `http://localhost:4200`

## Otros Comandos
| Comando | Descripción |
|---|---|
| `npm run build` | Genera la versión de producción en `dist/partner_service/`. |
| `npm run serve:ssr:partner_service` | Sirve la versión compilada con SSR (ejecutar antes `npm run build`). |
| `npm test` | Ejecuta las pruebas unitarias (Vitest). |
| `npm run watch` | Recompila automáticamente en modo desarrollo al guardar cambios. |

## Usuarios de Prueba (Clave universal: `123456`)
| Rol | Correo | Área |
|---|---|---|
| Coordinador | `ricardo.coordinador@asiscorp.pe` | Operaciones |
| Supervisor | `laura.supervisor@asiscorp.pe` | Operaciones |
| Supervisor | `diana.supervisor@asiscorp.pe` | Atención al Cliente |
| Asesor | `robin.asesor@asiscorp.pe` | Operaciones |
| Asesor | `carlos.quispe@asiscorp.pe` | Operaciones |
| Asesor | `andrea.torres@asiscorp.pe` | Atención al Cliente |

Los supervisores y el coordinador ingresan al **Panel RR.HH.**; los asesores ingresan a **Marcación**.

## Carga Masiva de Programación (CSV)
Desde el Panel RR.HH. se puede descargar la plantilla `plantilla_programacion_semanal.csv` (también disponible en `public/`). Formato:

```csv
dni,inicio_semana,rango_id,dia_descanso
72345678,2026-11-23,1,7
```

- `inicio_semana`: fecha del lunes de la semana, en formato `AAAA-MM-DD`.
- `rango_id`: `1` = 08:30–17:30 (Full Time), `2` = 09:00–15:00 (Semi Full), `3` = 14:00–18:00 (Part Time).
- `dia_descanso`: `1` = Lunes … `7` = Domingo.
- Se acepta `,` o `;` como separador. Solo se procesan los DNI del equipo del usuario que carga el archivo.

## Datos de la Aplicación
No hay backend: usuarios, asistencias, programaciones y permisos se guardan en el `localStorage` del navegador y se cargan con datos de ejemplo la primera vez. Para reiniciar los datos, borra el almacenamiento del sitio desde las herramientas de desarrollador del navegador (**Aplicación → Almacenamiento → Borrar datos del sitio**) y recarga la página.