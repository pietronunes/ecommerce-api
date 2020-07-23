const router = require("express").Router();
const EntregaController = require("../../../controllers/EntregaController");

const auth = require("../../auth");
const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");
const { EntregaValidation } = require("../../../controllers/validacoes/entregaValidation");
const Validation = require("express-validation");

const entregaController = new EntregaController();

// ENTREGA ROTAS
router.get("/:id", auth.required, Validation(EntregaValidation.show), entregaController.show);
router.put("/:id", auth.required, LojaValidation.admin, Validation(EntregaValidation.update), entregaController.update);
router.post("/calcular", Validation(EntregaValidation.calcular), entregaController.calcular);

module.exports = router;
