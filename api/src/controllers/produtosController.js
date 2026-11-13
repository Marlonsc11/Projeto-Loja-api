import supabase from '../db/config.js';

// Criar novo produto
async function CriarProduto(request, response) {
    try {
        const {
            nome,
            imagem_url,
            descricao,
            preco,
            quantidade,
            id_categorias,
            id_lojas
        } = request.body;

        if (!id_categorias) {
            return response.status(400).json({
                mensagem: "O id_categorias é obrigatório;"
            });
        }

        if (!id_lojas) {
            return response.status(400).json({
                mensagem: "O id_lojas é obrigatório;"
            });
        }

        // Validação da categoria
        const { data: categoria, error: catError } = await supabase
            .from('categorias')
            .select('id')
            .eq('id', id_categorias)
            .maybeSingle();

        if (catError) {
            return response.status(500).json({
                mensagem: "Erro ao consultar categoria.",
                detalhes: catError.message
            });
        }

        if (!categoria) {
            return response.status(404).json({ 
                mensagem: "Categoria não encontrada"
            });
        }

        // Validação da loja
        const { data: loja, error: lojaError } = await supabase
            .from('lojas')
            .select('id')
            .eq('id', id_lojas)
            .maybeSingle();

        if (lojaError) {
            return response.status(500).json({
                mensagem: "Erro ao consultar loja.",
                detalhes: lojaError.message
            });
        }

        if (!loja) {
            return response.status(404).json({
                mensagem: "Loja não encontrada"
            });
        }

        const { data: novoProduto, error: insertError } = await supabase
            .from('produtos')
            .insert([{
                nome: nome || '',
                imagem_url: imagem_url || null,
                descricao: descricao || null,
                preco: preco !== undefined ? Number(preco) : 0,
                quantidade: quantidade !== undefined ? Number(quantidade) : 0,
                id_categorias,
                id_lojas
            }])
            .select()
            .single();

        if (insertError) {
            return response.status(500).json({
                mensagem: "Erro ao cadastrar produto.",
                detalhes: insertError.message
            });
        }

        return response.json({
            mensagem: "Produto cadastrado com sucesso!",
            id: novoProduto?.id
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Listar produtos da loja com filtros dinâmicos
async function ListarProdutos(request, response) {
    try {
        const { id } = request.params;
        const { texto, categoria, qtdMIN, qtdMAX, precoMIN, precoMAX } = request.query;

        // Verificar existência da loja
        const { data: loja, error: lojaError } = await supabase
            .from('lojas')
            .select('id, nome')
            .eq('id', id)
            .maybeSingle();

        if (lojaError) {
            return response.status(500).json({
                mensagem: "Erro ao verificar loja.",
                detalhes: lojaError.message
            });
        }

        if (!loja) {
            return response.status(404).json({
                mensagem: "Loja não encontrada"
            });
        }

        let query = supabase
            .from('produtos')
            .select(`
                id,
                nome,
                imagem_url,
                descricao,
                preco,
                quantidade,
                id_categorias,
                id_lojas,
                categorias (
                    id,
                    nome
                )
            `)
            .eq('id_lojas', id)
            .order('id', { ascending: true });

        if (texto) {
            query = query.or(`nome.ilike.%${texto}%,descricao.ilike.%${texto}%`);
        }
        if (precoMIN) {
            query = query.gte('preco', Number(precoMIN));
        }
        if (precoMAX) {
            query = query.lte('preco', Number(precoMAX));
        }
        if (qtdMIN) {
            query = query.gte('quantidade', Number(qtdMIN));
        }
        if (qtdMAX) {
            query = query.lte('quantidade', Number(qtdMAX));
        }

        const { data: produtos, error: produtosError } = await query;

        if (produtosError) {
            return response.status(500).json({
                mensagem: "Erro ao consultar produtos.",
                detalhes: produtosError.message
            });
        }

        let produtosFormatados = (produtos || []).map(p => ({
            id: p.id,
            nome: p.nome,
            imagem_url: p.imagem_url,
            descricao: p.descricao,
            preco: Number(p.preco),
            quantidade: Number(p.quantidade),
            id_categoria: p.categorias?.id || p.id_categorias,
            nome_categoria: p.categorias?.nome || ""
        }));

        if (categoria) {
            const catFiltro = String(categoria).trim().toLowerCase();
            produtosFormatados = produtosFormatados.filter(p => 
                String(p.id_categoria) === catFiltro || 
                p.nome_categoria.toLowerCase().includes(catFiltro)
            );
        }

        return response.json({ produtos: produtosFormatados });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Buscar produto por ID
async function BuscarProdutoPorId(request, response) {
    try {
        const { id } = request.params;

        const { data: p, error } = await supabase
            .from('produtos')
            .select(`
                id,
                nome,
                imagem_url,
                descricao,
                preco,
                quantidade,
                id_categorias,
                id_lojas,
                categorias (
                    id,
                    nome
                )
            `)
            .eq('id', id)
            .maybeSingle();

        if (error) {
            return response.status(500).json({
                mensagem: "Erro ao buscar produto.",
                detalhes: error.message
            });
        }

        if (!p) {
            return response.status(404).json({
                mensagem: "Produto não encontrado!"
            });
        }

        const produtoFormatado = {
            id: p.id,
            nome: p.nome,
            imagem_url: p.imagem_url,
            descricao: p.descricao,
            preco: Number(p.preco),
            quantidade: Number(p.quantidade),
            id_categoria: p.categorias?.id || p.id_categorias,
            nome_categoria: p.categorias?.nome || "",
            id_lojas: p.id_lojas
        };

        return response.json({
            ...produtoFormatado,
            produto: produtoFormatado
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Atualizar produto existente
async function AtualizarProduto(request, response) {
    try {
        const { id } = request.params;
        const {
            nome,
            imagem_url,
            descricao,
            preco,
            quantidade,
            id_categorias
        } = request.body;

        const camposAtualizar = {};

        if (imagem_url !== undefined) {
            camposAtualizar.imagem_url = imagem_url;
        }

        if (id_categorias) {
            const { data: categoria, error: catError } = await supabase
                .from('categorias')
                .select('id')
                .eq('id', id_categorias)
                .maybeSingle();

            if (catError) {
                return response.status(500).json({
                    mensagem: "Erro ao validar categoria.",
                    detalhes: catError.message
                });
            }

            if (!categoria) {
                return response.status(404).json({
                    mensagem: "Categoria não encontrada"
                });
            }

            camposAtualizar.id_categorias = categoria.id;
        }

        if (nome !== undefined) {
            camposAtualizar.nome = nome;
        }

        if (descricao !== undefined) {
            camposAtualizar.descricao = descricao;
        }

        if (preco !== undefined) {
            camposAtualizar.preco = Number(preco);
        }

        if (quantidade !== undefined) {
            camposAtualizar.quantidade = Number(quantidade);
        }

        if (Object.keys(camposAtualizar).length === 0) {
            return response.status(400).json({
                mensagem: "Nenhum campo fornecido para atualização."
            });
        }

        const { error: updateError } = await supabase
            .from('produtos')
            .update(camposAtualizar)
            .eq('id', id);

        if (updateError) {
            return response.status(500).json({
                mensagem: "Erro ao atualizar produto.",
                detalhes: updateError.message
            });
        }

        return response.json({
            mensagem: "Produto atualizado com sucesso!"
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

// Excluir produto por ID
async function ExcluirProduto(request, response) {
    try {
        const { id } = request.params;

        const { data: produto, error: findError } = await supabase
            .from('produtos')
            .select('id')
            .eq('id', id)
            .maybeSingle();

        if (findError) {
            return response.status(500).json({
                mensagem: "Erro ao buscar produto.",
                detalhes: findError.message
            });
        }

        if (!produto) {
            return response.status(404).json({
                mensagem: "Produto não encontrado!"
            });
        }

        const { error: deleteError } = await supabase
            .from('produtos')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return response.status(500).json({
                mensagem: "Erro ao remover produto.",
                detalhes: deleteError.message
            });
        }

        return response.json({
            mensagem: "O produto foi removido com sucesso!"
        });
    } catch (err) {
        return response.status(500).json({
            mensagem: "Erro interno no servidor.",
            detalhes: err.message
        });
    }
}

export { CriarProduto, ListarProdutos, BuscarProdutoPorId, AtualizarProduto, ExcluirProduto };
