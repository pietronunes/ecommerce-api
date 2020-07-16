const router = require("express").Router();
const AvaliacaoController = require("../../../controllers/AvaliacaoController");

const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");
const { AvaliacaoValidation } = require("../../../controllers/validacoes/avaliacaoValidation");
const Validation = require("express-validation");

const auth = require("../../auth");

const avaliacaoController = new AvaliacaoController();

//CLIENTES-VISITANTES
router.get("/", Validation(AvaliacaoValidation.index), avaliacaoController.index); //checked
router.get("/:id", Validation(AvaliacaoValidation.show) , avaliacaoController.show); //checked
router.post("/", auth.required, Validation(AvaliacaoValidation.store) , avaliacaoController.store); //checked
//ADMIN
router.delete("/:id", auth.required, LojaValidation.admin, Validation(AvaliacaoValidation.remove), avaliacaoController.remove); //checked


module.exports = router;