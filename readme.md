# DentalConnect - Plataforma de Gestión para Laboratorios de Mecánica Dental

DentalConnect es una plataforma web fullstack B2B diseñada para digitalizar, optimizar y acelerar el flujo de trabajo entre clínicas odontológicas y laboratorios de mecánica dental. El sistema actúa como una landing page de alta conversión y un portal operativo que elimina la fricción en la solicitud, facturación y seguimiento de prótesis y dispositivos dentales.

## 🚀 Propósito del Proyecto

El principal dolor de cabeza en el sector dental es la pérdida de tiempo en la comunicación manual y el seguimiento logístico de los casos. Esta plataforma resuelve ese problema centralizando todo el ciclo de vida de una orden de trabajo de forma automatizada y transparente.

## 📌 Características Clave

### 1. Portal del Odontólogo (Área Privada)
* **Autenticación Segura:** Acceso cifrado para clínicas asociadas mediante JWT y hashing de credenciales.
* **Gestión de Órdenes Interactiva:** Formulario inteligente para registrar nuevos casos especificando el tipo de trabajo (Fija, Removible, Ortodoncia), piezas dentales afectadas, tonalidad (Guía VITA) y material requerido.
* **Carga de Archivos de Impresión:** Sistema optimizado para adjuntar prescripciones médicas, fotografías clínicas y archivos de escaneo digital.

### 2. Motor de Cotización en Tiempo Real
* **Calculadora Dinámica:** Genera presupuestos instantáneos basados en la combinación de materiales seleccionados (Zirconio, Disilicato de Litio, Acrílico) y número de piezas, calculando de forma automática la fecha estimada de entrega.

### 3. Seguimiento de Casos (Pipeline de Producción)
* Sistema de trazabilidad que permite al odontólogo conocer el estado exacto de su pedido en tiempo real:
  `Recibido` ➡️ `En Diseño` ➡️ `En Fabricación` ➡️ `Control de Calidad` ➡️ `En Despacho`.

### 4. Panel de Administración del Laboratorio
* Gestión interna de inventario de materiales.
* Facturación automatizada y reportes de órdenes completadas por clínica.
* Modificación de estados de producción con notificaciones automáticas.

## 🛠️ Stack Tecnológico

La plataforma está construida utilizando tecnologías modernas orientadas al rendimiento, escalabilidad y mantenibilidad bajo los principios de **Clean Architecture** y **SOLID**:

* **Frontend:** React (Vite), TypeScript, Tailwind CSS.
* **Backend:** Python (Flask) / Ruby (Roda) - *Arquitectura RESTful limpia y desacoplada*.
* **Base de Datos:** PostgreSQL / MariaDB - *Esquema relacional sólido para la consistencia en el estado de las órdenes*.
* **Infraestructura y DevOps:** Contenedores (Docker / Podman), Git para control de versiones y despliegues optimizados.
