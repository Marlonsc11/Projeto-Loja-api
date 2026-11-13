import { Router } from "express";
import { 
    AtualizarProduto, 
    CriarProduto, 
    ExcluirProduto, 
    ListarProdutos,
    BuscarProdutoPorId
} from "../controllers/produtosController.js";

const produtoRouter = new Router();

produtoRouter.get('/loja/:id', ListarProdutos);
produtoRouter.get('/:id', BuscarProdutoPorId);
produtoRouter.post('/criar', CriarProduto);
produtoRouter.delete('/excluir/:id', ExcluirProduto);
produtoRouter.delete('/:id', ExcluirProduto);
produtoRouter.put('/atualizar/:id', AtualizarProduto);
produtoRouter.put('/:id', AtualizarProduto);

export default produtoRouter;
