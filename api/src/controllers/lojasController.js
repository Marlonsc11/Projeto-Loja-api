import supabase from '../db/config.js';

// Listar todas as lojas
async function ListarLojas(request, response) {
    try {
        const { data: lojas, error } = await supabase
            .from('lojas')
            .select('id, nome, descricao, imagem_url, id_usuarios')
            .order('id', { ascending: true });

        if (error) {
            return response.status(500).json({
                mensagem: "Erro ao listar lojas.",
                detalhes: error.message
            });
        }

        return response.json({ lojas: lojas || [] });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Buscar loja por ID
async function BuscarLojaPorId(request, response) {
    try {
        const { id } = request.params;

        const { data: loja, error } = await supabase
            .from('lojas')
            .select('id, nome, descricao, imagem_url, id_usuarios')
            .eq('id', id)
            .maybeSingle();

        if (error) {
            return response.status(500).json({
                mensagem: "Erro ao buscar loja.",
                detalhes: error.message
            });
        }

        if (!loja) {
            return response.status(404).json({
                mensagem: "Loja não encontrada."
            });
        }

        return response.json({ loja });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Listar apenas as lojas pertencentes ao usuário autenticado/solicitado
async function BuscarLojasDoUsuario(request, response) {
    try {
        const { id } = request.params;

        // Verificar se usuário existe
        const { data: usuario, error: userError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', id)
            .maybeSingle();

        if (userError) {
            return response.status(500).json({
                mensagem: "Erro ao verificar usuário.",
                detalhes: userError.message
            });
        }

        if (!usuario) {
            return response.status(404).json({
                mensagem: "Usuário não encontrado."
            });
        }

        const { data: lojas, error: lojasError } = await supabase
            .from('lojas')
            .select('id, nome, descricao, imagem_url, id_usuarios')
            .eq('id_usuarios', id)
            .order('id', { ascending: true });

        if (lojasError) {
            return response.status(500).json({
                mensagem: "Erro ao buscar lojas do usuário.",
                detalhes: lojasError.message
            });
        }

        return response.json({
            lojas: lojas || []
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Criar nova loja vinculada estritamente ao usuário logado
async function CriarLoja(request, response) {
    try {
        const { nome, descricao, imagem_url, id_usuarios } = request.body;

        if (!nome) {
            return response.status(400).json({
                mensagem: "O nome da loja é obrigatório."
            });
        }

        if (!id_usuarios) {
            return response.status(400).json({
                mensagem: "O id do usuário proprietário é obrigatório."
            });
        }

        const { data: usuario, error: userError } = await supabase
            .from('usuarios')
            .select('id')
            .eq('id', id_usuarios)
            .maybeSingle();

        if (userError) {
            return response.status(500).json({
                mensagem: "Erro ao verificar usuário proprietário.",
                detalhes: userError.message
            });
        }

        if (!usuario) {
            return response.status(404).json({
                mensagem: "Usuário proprietário não encontrado."
            });
        }

        const { data: novaLoja, error: insertError } = await supabase
            .from('lojas')
            .insert([{
                nome,
                descricao: descricao || null,
                imagem_url: imagem_url || null,
                id_usuarios
            }])
            .select()
            .single();

        if (insertError) {
            return response.status(500).json({
                mensagem: "Erro ao cadastrar loja.",
                detalhes: insertError.message
            });
        }

        return response.status(201).json({
            mensagem: "Loja cadastrada com sucesso!",
            id: novaLoja.id
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Atualizar loja garantindo que pertence ao usuário
async function AtualizarLoja(request, response) {
    try {
        const { id } = request.params;
        const { nome, descricao, imagem_url, id_usuarios } = request.body;

        // Verificar se a loja existe
        const { data: loja, error: findError } = await supabase
            .from('lojas')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (findError) {
            return response.status(500).json({
                mensagem: "Erro ao buscar loja.",
                detalhes: findError.message
            });
        }

        if (!loja) {
            return response.status(404).json({
                mensagem: "Loja não encontrada."
            });
        }

        // Validação de permissão: apenas o usuário proprietário pode modificar
        if (id_usuarios && Number(loja.id_usuarios) !== Number(id_usuarios)) {
            return response.status(403).json({
                mensagem: "Permissão negada. Você só pode modificar lojas cadastradas na sua conta."
            });
        }

        const dadosAtualizacao = {};

        if (nome !== undefined) dadosAtualizacao.nome = nome;
        if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
        if (imagem_url !== undefined) dadosAtualizacao.imagem_url = imagem_url;

        if (Object.keys(dadosAtualizacao).length === 0) {
            return response.status(400).json({
                mensagem: "Nenhum campo fornecido para atualização."
            });
        }

        const { error: updateError } = await supabase
            .from('lojas')
            .update(dadosAtualizacao)
            .eq('id', id);

        if (updateError) {
            return response.status(500).json({
                mensagem: "Erro ao atualizar loja.",
                detalhes: updateError.message
            });
        }

        return response.json({
            mensagem: "Loja atualizada com sucesso!"
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Excluir loja garantindo que pertence ao usuário
async function ExcluirLoja(request, response) {
    try {
        const { id } = request.params;
        const id_usuarios = request.query.id_usuarios || request.body?.id_usuarios;

        // Verificar se a loja existe
        const { data: loja, error: findError } = await supabase
            .from('lojas')
            .select('*')
            .eq('id', id)
            .maybeSingle();

        if (findError) {
            return response.status(500).json({
                mensagem: "Erro ao buscar loja.",
                detalhes: findError.message
            });
        }

        if (!loja) {
            return response.status(404).json({
                mensagem: "Loja não encontrada."
            });
        }

        // Validação de permissão: apenas o proprietário pode excluir
        if (id_usuarios && Number(loja.id_usuarios) !== Number(id_usuarios)) {
            return response.status(403).json({
                mensagem: "Permissão negada. Você só pode excluir lojas da sua própria conta."
            });
        }

        // Excluir produtos vinculados à loja primeiro para manter consistência
        await supabase.from('produtos').delete().eq('id_lojas', id);

        // Excluir a loja
        const { error: deleteError } = await supabase
            .from('lojas')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return response.status(500).json({
                mensagem: "Erro ao excluir loja.",
                detalhes: deleteError.message
            });
        }

        return response.json({
            mensagem: "Loja e seus respectivos produtos excluídos com sucesso!"
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

export { ListarLojas, BuscarLojaPorId, BuscarLojasDoUsuario, CriarLoja, AtualizarLoja, ExcluirLoja };
