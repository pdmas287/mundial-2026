#!/bin/bash

# ===========================================
# Script de despliegue para Mundial 2026
# Ejecutar como root en Ubuntu 24.04
# ===========================================

set -e  # Salir si hay errores

echo "=========================================="
echo "  Despliegue de Mundial 2026"
echo "  VPS: 195.200.6.223"
echo "  Dominio: mundial2026.fun"
echo "=========================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir pasos
print_step() {
    echo -e "\n${GREEN}[PASO]${NC} $1\n"
}

print_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que se ejecuta como root
if [ "$EUID" -ne 0 ]; then
    print_error "Este script debe ejecutarse como root"
    exit 1
fi

# ==========================================
# PASO 1: Actualizar sistema
# ==========================================
print_step "Actualizando sistema..."
apt update && apt upgrade -y

# ==========================================
# PASO 2: Instalar dependencias básicas
# ==========================================
print_step "Instalando dependencias básicas..."
apt install -y curl git build-essential

# ==========================================
# PASO 3: Instalar Node.js 20 LTS
# ==========================================
print_step "Instalando Node.js 20 LTS..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_warning "Node.js ya está instalado: $NODE_VERSION"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo "Node.js instalado: $(node --version)"
fi

# ==========================================
# PASO 4: Instalar PM2
# ==========================================
print_step "Instalando PM2..."
npm install -g pm2

# ==========================================
# PASO 5: Crear usuario para la aplicación
# ==========================================
print_step "Configurando usuario mundial2026..."
if id "mundial2026" &>/dev/null; then
    print_warning "Usuario mundial2026 ya existe"
else
    adduser --disabled-password --gecos "" mundial2026
    echo "Usuario mundial2026 creado"
fi

# Crear directorio de logs
mkdir -p /home/mundial2026/logs
chown mundial2026:mundial2026 /home/mundial2026/logs

# ==========================================
# PASO 6: Configurar Nginx
# ==========================================
print_step "Configurando Nginx..."

# Verificar si Nginx está instalado
if ! command -v nginx &> /dev/null; then
    apt install -y nginx
fi

# Crear configuración de Nginx
cat > /etc/nginx/sites-available/mundial2026.fun << 'EOF'
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

    location /_next/static {
        proxy_pass http://127.0.0.1:3000;
        proxy_cache_valid 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    client_max_body_size 10M;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript application/json;
}
EOF

# Activar sitio
ln -sf /etc/nginx/sites-available/mundial2026.fun /etc/nginx/sites-enabled/

# Eliminar sitio default si existe
rm -f /etc/nginx/sites-enabled/default

# Verificar y reiniciar Nginx
nginx -t && systemctl restart nginx
echo "Nginx configurado correctamente"

# ==========================================
# PASO 7: Configurar Firewall
# ==========================================
print_step "Configurando Firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
echo "Firewall configurado"

# ==========================================
# PASO 8: Configurar PM2 para inicio automático
# ==========================================
print_step "Configurando PM2 para inicio automático..."
pm2 startup systemd -u mundial2026 --hp /home/mundial2026

# ==========================================
# Resumen
# ==========================================
echo ""
echo "=========================================="
echo -e "${GREEN}  ¡Configuración del servidor completada!${NC}"
echo "=========================================="
echo ""
echo "Próximos pasos:"
echo ""
echo "1. Subir el código de la aplicación:"
echo "   scp -r /ruta/local/* mundial2026@195.200.6.223:/home/mundial2026/mundial2026-app/"
echo ""
echo "2. Configurar variables de entorno:"
echo "   ssh mundial2026@195.200.6.223"
echo "   cd mundial2026-app"
echo "   nano .env"
echo ""
echo "3. Instalar y construir:"
echo "   npm install"
echo "   npx prisma generate"
echo "   npm run build"
echo ""
echo "4. Iniciar con PM2:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo ""
echo "5. Configurar SSL (HTTPS):"
echo "   sudo certbot --nginx -d mundial2026.fun -d www.mundial2026.fun"
echo ""
echo "=========================================="
