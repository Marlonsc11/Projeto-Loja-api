import supabase from "../db/config.js";

async function Login(request, response) {
    try {
        const { email, senha } = request.body;

        if (!email) {
            return response.status(404).json({
                mensagem: "O email é obrigatório."
            });
        }
        if (!senha) {
            return response.status(404).json({
                mensagem: "A senha é obrigatória."
            });
        }

        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('*')
            .ilike('email', email.trim().toLowerCase());

        if (error) {
            return response.status(500).json({
                mensagem: "Erro ao consultar banco de dados.",
                detalhes: error.message
            });
        }

        if (!usuarios || usuarios.length === 0) {
            return response.status(401).json({
                mensagem: "Nenhuma conta foi encontrada."
            });
        }

        const usuario = usuarios[0];

        if (usuario.senha !== senha) {
            return response.status(401).json({
                mensagem: "Usuário ou senha incorretos."
            });
        }

        return response.json({
            usuarios: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

export { Login };
