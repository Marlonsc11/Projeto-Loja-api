import { Router } from "express";
import { 
    ListarLojas, 
    BuscarLojaPorId, 
    BuscarLojasDoUsuario, 
    CriarLoja, 
    AtualizarLoja, 
    ExcluirLoja 
} from "../controllers/lojasController.js";

const lojasRouter = new Router();

lojasRouter.get('/', ListarLojas);
lojasRouter.get('/:id', BuscarLojaPorId);
lojasRouter.get('/usuarios/:id', BuscarLojasDoUsuario);
lojasRouter.post('/criar', CriarLoja);
lojasRouter.put('/atualizar/:id', AtualizarLoja);
lojasRouter.delete('/excluir/:id', ExcluirLoja);

export default lojasRouter;
