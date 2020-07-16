const router = require("express").Router();
const ProdutoController = require('../../../controllers/ProdutoController');

const auth = require('../../auth');

const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");
const { ProdutoValidation } = require("../../../controllers/validacoes/produtoValidation");
const Validation = require("express-validation");

const upload = require('../../../config/multer');

const produtoController = new ProdutoController();

//ADMIN
router.post("/", auth.required, LojaValidation.admin, Validation(ProdutoValidation.store),produtoController.store); //checked
router.put("/:id", auth.required, LojaValidation.admin, Validation(ProdutoValidation.update), produtoController.update); //checked
router.put("/images/:id", auth.required, LojaValidation.admin, Validation(ProdutoValidation.updateImages), upload.array("files", 4), produtoController.updateImages); //checked
router.delete("/:id", auth.required, LojaValidation.admin, Validation(ProdutoValidation.remove), produtoController.remove); //checked


//CLIENTE/VISITANTE
router.get("/", Validation(ProdutoValidation.index), produtoController.index); //checked
router.get("/disponiveis", Validation(ProdutoValidation.indexDisponiveis), produtoController.indexDisponiveis); //checked
router.get("/search/:search", Validation(ProdutoValidation.search), produtoController.search); //checked
router.get("/:id", Validation(ProdutoValidation.show), produtoController.show); //checked


//VARIACOES


//AVALIACOES
router.get("/:id/avaliacoes", Validation(ProdutoValidation.showAvaliacoes), produtoController.showAvaliacoes); //checked

module.exports = router;