import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import categoriasRoutes from "./routes/categoriasRoutes.js";
import produtoRouter from "./routes/produtosRoutes.js";
import usuarioRouter from "./routes/usuariosRoutes.js";
import lojasRouter from "./routes/lojasRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const app = express();

// ============================================================
// MIDDLEWARES GLOBAIS
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// DETECÇÃO DO CAMINHO DOS ARQUIVOS ESTÁTICOS
// - Vercel: api/public/ (copiado pelo scripts/build.js)
// - Local:  ../../public/ ou ../../site/ (fallback)
// ============================================================
const localApiPublic = path.resolve(__dirname, '../public');
const rootPublic     = path.resolve(__dirname, '../../public');
const rootSite       = path.resolve(__dirname, '../../site');

const staticPath = fs.existsSync(localApiPublic)
    ? localApiPublic
    : (fs.existsSync(rootPublic) ? rootPublic : rootSite);

// ============================================================
// ROTAS DA API (ANTES dos middlewares de arquivos estáticos)
// ============================================================

// Health check — apenas GET /api (nunca GET / para não sobrepor a vitrine)
app.get('/api', (req, res) => {
    res.status(200).json({
        status: 'online',
        mensagem: 'API Mostruário Streetwear ativa e integrada ao Supabase!',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/categorias', categoriasRoutes);
app.use('/api/produtos', produtoRouter);
app.use('/api/usuarios', usuarioRouter);
app.use('/api/lojas', lojasRouter);

// ============================================================
// ROTAS DE PÁGINAS HTML (ANTES do express.static para evitar
// que o static redirecione /admin → /admin/ com 301)
// ============================================================

// /admin e /admin/ → sempre entrega o login.html
app.get(['/admin', '/admin/'], (req, res) => {
    res.sendFile(path.join(staticPath, 'admin', 'login.html'));
});

// / → vitrine (index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
});

// ============================================================
// ARQUIVOS ESTÁTICOS (CSS, JS, imagens, etc.)
// ============================================================
app.use('/admin', express.static(path.join(staticPath, 'admin')));
app.use(express.static(staticPath));

// ============================================================
// SERVIDOR LOCAL (desabilitado automaticamente na Vercel)
// ============================================================
if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 API:     http://localhost:${PORT}/api`);
        console.log(`🌐 Vitrine: http://localhost:${PORT}/`);
        console.log(`🔐 Admin:   http://localhost:${PORT}/admin`);
        console.log(`📂 Static:  ${staticPath}`);
    });
}

export default app;
