// Script para ayudar a configurar el archivo .env
const fs = require('fs');
const path = require('path');

console.log('🔧 Configuración del archivo .env\n');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

// Leer el .env.example
let envContent = fs.readFileSync(envExamplePath, 'utf8');

// Generar NEXTAUTH_SECRET
const crypto = require('crypto');
const nextAuthSecret = crypto.randomBytes(32).toString('base64');

// Reemplazar el NEXTAUTH_SECRET
envContent = envContent.replace(
  'tu-secreto-super-seguro-aqui-genera-uno-con-openssl-rand-base64-32',
  nextAuthSecret
);

console.log('✅ Archivo .env configurado con:');
console.log('   - NEXTAUTH_SECRET: Generado automáticamente');
console.log('   - NEXTAUTH_URL: http://localhost:3000\n');

console.log('⚠️  IMPORTANTE:');
console.log('   Debes editar .env y agregar tu DATABASE_URL de Supabase\n');

console.log('📝 Instrucciones:');
console.log('   1. Ve a https://supabase.com y accede a tu proyecto');
console.log('   2. Settings → Database → Connection string → URI');
console.log('   3. Copia la URL y pégala en .env en la línea DATABASE_URL\n');

console.log('Ejemplo de DATABASE_URL:');
console.log('DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"\n');

// Escribir el archivo .env
fs.writeFileSync(envPath, envContent);

console.log('✅ Archivo .env creado exitosamente!');
console.log('\n📌 Siguiente paso: Edita .env y agrega tu DATABASE_URL');
