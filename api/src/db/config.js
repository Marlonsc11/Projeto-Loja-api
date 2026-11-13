import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Carrega .env da pasta api e da raiz
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://krmgdyarvnwgcmzabpit.supabase.co';

// Chave publishable oficial validada deste projeto
const KNOWN_PUBLISHABLE_KEY = 'sb_publishable_lO04EbD44i4qX93e09QyIQ_xK8aeeJz';

function resolveSupabaseKey() {
    const candidates = [
        process.env.SUPABASE_KEY,
        process.env.SUPABASE_PUBLISHABLE_KEY,
        process.env.SUPABASE_ANON_KEY,
        process.env.SUPABASE_SECRET_KEY
    ].filter(Boolean);

    // Chaves que começam com sb_secret_ NÃO funcionam no REST endpoint do Supabase
    // e causam o erro: "401 Unregistered API key".
    // Prioriza chaves válidas (anon ou publishable):
    const validKey = candidates.find(k => !k.startsWith('sb_secret_'));

    if (validKey) {
        return validKey;
    }

    // Se a única chave fornecida for sb_secret_ ou estiver vazia, usa a publishable validada
    console.warn('⚠️ [AVISO] Chave secret detectada ou ausente. Usando chave publishable válida para acesso REST.');
    return KNOWN_PUBLISHABLE_KEY;
}

const supabaseKey = resolveSupabaseKey();

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false }
});

export default supabase;
