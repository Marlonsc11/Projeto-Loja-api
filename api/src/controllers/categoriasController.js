import supabase from '../db/config.js';

// Listar todas as categorias
async function ListarCategorias(request, response) {
    try {
        const { data: categorias, error } = await supabase
            .from('categorias')
            .select('*')
            .order('id', { ascending: true });

        if (error) {
            return response.status(500).json({
                mensagem: "Erro ao listar categorias.",
                detalhes: error.message
            });
        }

        return response.json({ categorias: categorias || [] });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Criar nova categoria
async function CriarCategoria(request, response) {
    try {
        const { nome } = request.body;

        if (!nome) {
            return response.status(400).json({
                mensagem: "O nome da categoria é obrigatório."
            });
        }

        const { data, error } = await supabase
            .from('categorias')
            .insert([{ nome }])
            .select();

        if (error) {
            return response.status(500).json({
                mensagem: "Erro ao cadastrar categoria.",
                detalhes: error.message
            });
        }

        return response.json({
            mensagem: "Categoria cadastrada com sucesso!",
            messagem: "Categoria cadastrada com sucesso!",
            id: data?.[0]?.id
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Deletar categoria por ID
async function DeletarCategoria(request, response) {
    try {
        const { id } = request.params;

        const { error } = await supabase
            .from('categorias')
            .delete()
            .eq('id', id);

        if (error) {
            return response.status(500).json({
                mensagem: "Erro ao excluir categoria.",
                detalhes: error.message
            });
        }

        return response.json({
            mensagem: `A categoria com o id ${id} foi removida com sucesso!`
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Atualizar categoria existente
async function AtualizarCategoria(request, response) {
    try {
        const { id } = request.params;
        const { nome } = request.body;

        if (!nome) {
            return response.status(400).json({
                mensagem: "O nome é obrigatório"
            });
        }

        const { error } = await supabase
            .from('categorias')
            .update({ nome })
            .eq('id', id);

        if (error) {
            return response.status(500).json({
                mensagem: "Erro ao atualizar categoria.",
                detalhes: error.message
            });
        }

        return response.json({
            mensagem: "A categoria foi atualizada com sucesso!"
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

export { ListarCategorias, CriarCategoria, DeletarCategoria, AtualizarCategoria };
