# Partner Service — Sistema Web de Control de Asistencia y Programación Horaria

Aplicación web corporativa desarrollada en **Angular 22** para unificar el control de asistencia, gestión jerárquica de permisos, programación semanal rotativa (individual y carga masiva CSV) y analítica de indicadores operativos (KPIs) en **Partner Service**.

## Roles del Sistema
- **Asesor (`ASESOR`):** Marcación diaria de entrada/salida, consulta de turno semanal, historial personal y solicitud de permisos/justificaciones.
- **Supervisor (`SUPERVISOR`):** Gestión y evaluación de permisos de su equipo, programación semanal rotativa (individual/CSV) y monitoreo de indicadores.
- **Coordinador de Operaciones (`COORDINADOR_OPERACIONES`):** Visibilidad global de la operación, gestión transversal y exportación de métricas a CSV/Excel.

## Ejecución Local
1. Instalar dependencias: `npm install`
2. Iniciar servidor de desarrollo: `npm start`
3. Abrir en el navegador: `http://localhost:4200`

## Usuarios de Prueba (Clave universal: `123456`)
- **Coordinador:** `ricardo.coordinador@asiscorp.pe`
- **Supervisor:** `laura.supervisor@asiscorp.pe`
- **Asesor:** `robin.asesor@asiscorp.pe`