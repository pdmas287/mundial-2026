# 🚀 Guía de Despliegue — Mundial 2026

Guía paso a paso para administrar la app en el VPS Hostinger (Ubuntu).
Pensada para seguirla sin conocimientos técnicos previos.

---

## 📌 Datos importantes (memorízalos)

| Dato | Valor |
|---|---|
| **IP del VPS** | `195.200.6.223` |
| **Usuario SSH** | `root` |
| **Carpeta del proyecto** | `/home/mundial2026/mundial2026-app` |
| **Carpeta de arranque** | `/home/mundial2026/mundial2026-app/.next/standalone` |
| **Puerto interno** | `4000` |
| **Nombre del proceso PM2** | `mundial2026` |
| **Repositorio** | https://github.com/pdmas287/mundial-2026 |

> ⚠️ **El error más común:** la app **NO** está en `/root/mundial2026-app`.
> Está en `/home/mundial2026/mundial2026-app`. Si un comando falla con
> *"No such file or directory"*, casi siempre es por usar la ruta equivocada.

---

## 🔌 Cómo conectarse al VPS

Desde tu PC (PowerShell o terminal):

```bash
ssh root@195.200.6.223
```

Te pedirá la contraseña. Una vez dentro, verás algo como `root@srv551040:~#`.
Para salir del VPS cuando termines, escribe `exit`.

---

## ⚙️ CONFIGURACIÓN INICIAL (se hace UNA SOLA VEZ)

Estos tres pasos se ejecutan **una única vez**. Después ya no los repites nunca.

### Paso 1 — Crear el script de despliegue corregido

Copia y pega **todo este bloque completo** en el VPS y presiona Enter:

```bash
cat > /home/mundial2026/deploy.sh << 'EOF'
#!/bin/bash
set -e
echo "==> Yendo a la carpeta del proyecto..."
cd /home/mundial2026/mundial2026-app

echo "==> Trayendo ultimos cambios de GitHub..."
git stash || true
git pull origin main
git stash drop || true

echo "==> Instalando dependencias..."
npm install

echo "==> Generando Prisma Client..."
npx prisma generate

echo "==> Compilando la app..."
npm run build

echo "==> Copiando archivos estaticos al standalone..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

echo "==> Reiniciando la app en PM2..."
cd .next/standalone
pm2 restart mundial2026 || PORT=4000 NODE_ENV=production pm2 start server.js --name mundial2026
pm2 save

echo ""
echo "✅ Despliegue completado! La app esta en linea."
EOF
chmod +x /home/mundial2026/deploy.sh
```

### Paso 2 — Que la app arranque sola al reiniciar el VPS

Ejecuta:

```bash
pm2 startup
```

Esto te mostrará **otro comando** (empieza con `sudo env PATH=...`).
**Copia ese comando que te muestra y pégalo** para ejecutarlo.

### Paso 3 — Guardar el estado actual de PM2

```bash
pm2 save
```

✅ Con esto, **cada vez que el VPS se reinicie, la app se levantará sola**.
Ya no tendrás que hacer nada manualmente tras un reinicio.

---

## ✉️ Configuración de "Restablecer contraseña" (una sola vez)

La función de recuperación de contraseña envía un correo con un enlace seguro.
Para que funcione en producción, hay que configurar el SMTP de Hostinger **una vez**.

> ℹ️ La tabla de base de datos (`PasswordResetToken`) **ya fue creada** desde el
> entorno de desarrollo. No necesitas correr ninguna migración para esto.

### Paso 1 — Obtener las credenciales SMTP en Hostinger

En el panel de Hostinger (hPanel): **Correos → tu cuenta de correo → Configuración /
Detalles de configuración**. Anota: servidor SMTP, puerto, usuario (la dirección de
correo completa) y su contraseña.

### Paso 2 — Añadir las variables al `.env` del VPS

Edita el archivo `.env` del proyecto en el VPS:

```bash
nano /home/mundial2026/mundial2026-app/.env
```

Añade al final (reemplaza con tus datos reales de Hostinger):

```
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_USER=info@tudominio.com
SMTP_PASS=tu_password_de_correo
SMTP_FROM="Mundial 2026 <info@tudominio.com>"
```

Guarda con `Ctrl + O`, Enter, y sal con `Ctrl + X`.

### Paso 3 — Confirmar la URL pública

En el mismo `.env`, asegúrate de que `NEXTAUTH_URL` apunte a tu dominio real con
**https** (no a localhost). El enlace del correo se construye con esta variable:

```
NEXTAUTH_URL=https://tudominio.com
```

### Paso 4 — Reconstruir y reiniciar

```bash
bash /home/mundial2026/deploy.sh
```

> 💡 **Mientras no configures el SMTP:** la función no fallará, pero en vez de enviar
> el correo, el enlace de recuperación se imprimirá en los logs del servidor
> (`pm2 logs mundial2026`). Útil para probar antes de tener el correo listo.

### Cómo probar que funciona

1. Ve a tu dominio `/login` → clic en "¿Olvidaste tu contraseña?".
2. Ingresa el email de **tu propia cuenta** → "Enviar enlace".
3. Revisa tu correo (y la carpeta de spam). Abre el enlace.
4. Crea una nueva contraseña → deberías poder iniciar sesión con ella.

---

## 🔵 VÍA A — Actualizar código (después de subir cambios a GitHub)

Úsala cuando hiciste `git push` con cambios nuevos y quieres verlos en producción.

```bash
ssh root@195.200.6.223
bash /home/mundial2026/deploy.sh
```

Eso es todo. El script hace solo todo el proceso (traer código, instalar,
compilar, reiniciar). Al final verás:

```
✅ Despliegue completado! La app esta en linea.
```

---

## 🟢 VÍA B — Solo levantar la app (app caída, sin cambios de código)

Úsala cuando **NO** cambiaste código y solo necesitas que la app vuelva a estar
en línea (por ejemplo, si se cayó).

```bash
ssh root@195.200.6.223
pm2 restart mundial2026 || (cd /home/mundial2026/mundial2026-app/.next/standalone && PORT=4000 NODE_ENV=production pm2 start server.js --name mundial2026)
pm2 save
```

> 💡 Si hiciste la **Configuración Inicial** (Paso 2 y 3), normalmente **no
> necesitas esta vía tras un reinicio** — la app se levanta sola. Úsala solo si
> la app se cayó por algún otro motivo.

---

## 🔍 Comandos útiles para verificar

| Quiero... | Comando |
|---|---|
| Ver si la app está arriba | `pm2 status` |
| Ver los logs en vivo | `pm2 logs mundial2026` |
| Ver últimas 30 líneas de log | `pm2 logs mundial2026 --lines 30` |
| Probar que responde localmente | `curl http://localhost:4000` |
| Reiniciar la app | `pm2 restart mundial2026` |
| Detener la app | `pm2 stop mundial2026` |

> Para salir de la vista de logs (`pm2 logs`), presiona **Ctrl + C**.
> En `pm2 status`, el estado **online** (verde) significa que todo está bien.

---

## 🆘 Solución de problemas comunes

### ❌ "No such file or directory"
Estás en la carpeta equivocada. Recuerda: la app está en
`/home/mundial2026/mundial2026-app`, **no** en `/root/mundial2026-app`.

### ❌ "Process or Namespace mundial2026 not found"
La app nunca arrancó en PM2. Usa la **VÍA B** completa (con `pm2 start`, no solo
`restart`). El comando de la Vía B ya maneja este caso automáticamente.

### ❌ "ecosystem.config.js not found"
No necesitas ese archivo. Ignóralo y usa los comandos de esta guía tal cual.

### ⚠️ Mensajes "Dynamic server usage" durante el build
**Ya no deberían aparecer** (se corrigieron con `force-dynamic`). Si por algún
motivo reaparecen, **no son errores** — son informativos y la app funciona igual.

### ❌ La app levanta en localhost:4000 pero no se ve en el dominio
El problema está en el proxy reverso (Nginx). Revisa que Nginx esté apuntando al
puerto `4000`. Comando para reiniciar Nginx: `systemctl restart nginx`.

---

## 📋 Referencia ultra-rápida (lo esencial)

```bash
# Conectarse
ssh root@195.200.6.223

# VÍA A — Actualizar código tras un push
bash /home/mundial2026/deploy.sh

# VÍA B — Solo levantar la app
pm2 restart mundial2026 || (cd /home/mundial2026/mundial2026-app/.next/standalone && PORT=4000 NODE_ENV=production pm2 start server.js --name mundial2026)

# Verificar
pm2 status
pm2 logs mundial2026
```
