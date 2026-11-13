import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../site');
const destPublic = path.resolve(__dirname, '../public');
const destApiPublic = path.resolve(__dirname, '../api/public');

console.log('📦 Iniciando build do front-end...');
console.log(`   Origem:  ${srcDir}`);
console.log(`   Destino: ${destPublic}`);
console.log(`   Destino: ${destApiPublic}`);

[destPublic, destApiPublic].forEach(dest => {
    if (fs.existsSync(dest)) {
        fs.rmSync(dest, { recursive: true, force: true });
        console.log(`   🗑️  Removido: ${dest}`);
    }
    fs.cpSync(srcDir, dest, { recursive: true });
    console.log(`   ✅ Copiado para: ${dest}`);
});

console.log('✅ Build concluído! Pasta public/ pronta para o deploy na Vercel.');

