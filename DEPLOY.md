# Guía de Despliegue - Mundial 2026

## Información del Servidor
- **IP:** 195.200.6.223
- **OS:** Ubuntu 24.04 LTS
- **Dominio:** mundial2026.fun

---

## 1. Conectar al VPS

```bash
ssh root@195.200.6.223
```

---

## 2. Instalar Node.js 20 LTS

```bash
# Actualizar sistema
apt update && apt upgrade -y

# Instalar curl si no existe
apt install -y curl

# Agregar repositorio de NodeSource para Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
apt install -y nodejs

# Verificar instalación
node --version  # Debería mostrar v20.x.x
npm --version
```

---

## 3. Instalar PM2 (Process Manager)

```bash
npm install -g pm2

# Configurar PM2 para iniciar con el sistema
pm2 startup systemd
```

---

## 4. Crear usuario para la aplicación (recomendado)

```bash
# Crear usuario sin privilegios de root
adduser mundial2026
usermod -aG sudo mundial2026

# Cambiar a ese usuario para el resto de la configuración
su - mundial2026
```

---

## 5. Clonar el proyecto desde GitHub

```bash
cd /home/mundial2026
git clone https://github.com/pdmas287/mundial-2026.git mundial2026-app
cd mundial2026-app
```

---

## 6. Configurar variables de entorno

```bash
cd /home/mundial2026/mundial2026-app

# Crear archivo .env para producción
nano .env
```

Contenido del archivo `.env`:
```env
# Base de datos (ya tienes esto configurado)
DATABASE_URL="postgresql://usuario:password@localhost:5432/mundial2026?schema=public"

# NextAuth - IMPORTANTE: Cambiar en producción
NEXTAUTH_URL="https://mundial2026.fun"
NEXTAUTH_SECRET="genera-un-secret-seguro-aqui-min-32-caracteres"

# Entorno
NODE_ENV="production"
```

Para generar un secret seguro:
```bash
openssl rand -base64 32
```

---

## 7. Instalar dependencias y construir

```bash
cd /home/mundial2026/mundial2026-app

# Instalar dependencias
npm install

# Generar cliente Prisma
npx prisma generate

# Construir la aplicación (genera output standalone)
npm run build

# IMPORTANTE: Copiar archivos estáticos al standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
```

---

## 8. Configurar PM2

El archivo `ecosystem.config.js` ya viene incluido en el proyecto. Usa el servidor standalone:

```javascript
module.exports = {
  apps: [{
    name: 'mundial2026',
    script: '.next/standalone/server.js',
    cwd: '/home/mundial2026/mundial2026-app',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    }
  }]
}
```

Iniciar la aplicación:
```bash
pm2 start ecosystem.config.js
pm2 save
```

Comandos útiles de PM2:
```bash
pm2 status          # Ver estado
pm2 logs mundial2026  # Ver logs
pm2 restart mundial2026  # Reiniciar
pm2 stop mundial2026    # Detener
```

---

## 9. Configurar Nginx como Reverse Proxy

```bash
# Volver a root si estás como mundial2026
exit

# Crear configuración de Nginx
nano /etc/nginx/sites-available/mundial2026.fun
```

Contenido del archivo:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name mundial2026.fun www.mundial2026.fun;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
```

Activar el sitio:
```bash
# Crear enlace simbólico
ln -s /etc/nginx/sites-available/mundial2026.fun /etc/nginx/sites-enabled/

# Verificar configuración
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

---

## 10. Configurar SSL con Let's Encrypt (HTTPS)

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Obtener certificado SSL
certbot --nginx -d mundial2026.fun -d www.mundial2026.fun

# Seguir las instrucciones (email, aceptar términos, etc.)
```

Certbot configurará automáticamente Nginx para HTTPS y renovación automática.

---

## 11. Configurar Firewall

```bash
# Permitir SSH, HTTP y HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Activar firewall
ufw enable

# Verificar estado
ufw status
```

---

## 12. Configurar DNS en Hostinger

En el panel de Hostinger, configura los registros DNS:

| Tipo | Nombre | Contenido | TTL |
|------|--------|-----------|-----|
| A | @ | 195.200.6.223 | 3600 |
| A | www | 195.200.6.223 | 3600 |

---

## 13. Verificar despliegue

1. Espera 5-10 minutos para propagación DNS
2. Visita https://mundial2026.fun
3. Verifica que la aplicación cargue correctamente

---

## Comandos de Mantenimiento

### Actualizar la aplicación
```bash
cd /home/mundial2026/mundial2026-app
git pull origin main
npm install
npx prisma generate
npm run build
pm2 restart mundial2026
```

### Ver logs en tiempo real
```bash
pm2 logs mundial2026 --lines 100
```

### Reiniciar servicios
```bash
pm2 restart mundial2026
systemctl restart nginx
```

### Ejecutar scripts de administración
```bash
cd /home/mundial2026/mundial2026-app

# Crear admin
npm run crear-admin

# Asignar clasificados a eliminatorias
npm run asignar-clasificados

# Avanzar eliminatorias
npm run avanzar-eliminatorias

# Actualizar equipo placeholder
npm run actualizar-equipo "Playoff UEFA A" "Ucrania" "UKR" "https://flagcdn.com/w80/ua.png"
```

### Backup de base de datos
```bash
pg_dump -U usuario -d mundial2026 > backup_$(date +%Y%m%d).sql
```

---

## Solución de Problemas

### La app no inicia
```bash
pm2 logs mundial2026 --err --lines 50
```

### Error de conexión a base de datos
Verificar que DATABASE_URL en .env sea correcto y que PostgreSQL esté corriendo:
```bash
systemctl status postgresql
```

### Error 502 Bad Gateway
```bash
# Verificar que la app esté corriendo
pm2 status

# Verificar que Nginx apunte al puerto correcto
cat /etc/nginx/sites-enabled/mundial2026.fun
```

### Certificado SSL no funciona
```bash
certbot renew --dry-run
```
