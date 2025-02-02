# art0x.link - Acortador de URLs

art0x.link es una aplicación web para acortar URLs con panel de administración y redirección dinámica. El proyecto está construido con **Next.js** (App Router), utiliza **Supabase** para la base de datos y autenticación, y se despliega en **Vercel**. Además, cuenta con un diseño moderno y responsive, incluye notificaciones con react‑hot‑toast y un toggle personalizado para gestionar el estado activo de cada enlace.

## Características

- **Acortamiento de URLs:**  
  Crea enlaces cortos y personalizados que redirigen a la URL larga correspondiente.

- **Panel de Administración:**
    - Crear nuevos enlaces.
    - Edición inline de la URL en caso de error.
    - Toggle para activar/desactivar enlaces (con diseño personalizado: verde cuando activo y rojo cuando inactivo).
    - Búsqueda y paginación en la tabla de enlaces.
    - Notificaciones visuales para informar sobre el éxito o error de las acciones.

- **Redirección Dinámica:**  
  Cada enlace redirige al usuario a la URL larga, siempre que el enlace esté activo. Si está desactivado, se muestra un mensaje indicando que el enlace no está disponible.

## Tecnologías Utilizadas

- [Next.js](https://nextjs.org) – Framework de React para construir aplicaciones web con SSR y rutas dinámicas.
- [Supabase](https://supabase.com) – Plataforma backend basada en PostgreSQL para la gestión de la base de datos.
- [Vercel](https://vercel.com) – Plataforma de despliegue para aplicaciones web.
- [Tailwind CSS](https://tailwindcss.com) – Framework CSS para un diseño rápido y responsivo.
- [react-hot-toast](https://react-hot-toast.com/) – Librería para mostrar notificaciones (toasts) en la aplicación.

## Instalación y Configuración

### Prerrequisitos

- [Node.js](https://nodejs.org/) (versión LTS recomendada)
- [Git](https://git-scm.com/)

### Clonar el repositorio

```bash
git clone https://github.com/<TU_USUARIO>/<REPO>.git
cd <REPO>
