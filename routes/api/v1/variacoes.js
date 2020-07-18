const router = require("express").Router();

const auth = require("../../auth");
const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");
const { VariacaoValidation } = require("../../../controllers/validacoes/variacaoValidation");
const Validation = require("express-validation");

const VariacaoController = require("../../../controllers/VariacaoController");
const upload = require("../../../config/multer");
const variacaoController = new VariacaoController();

//CLIENTES/VISITANTES
router.get("/", Validation(VariacaoValidation.index), variacaoController.index);
router.get("/:id", Validation(VariacaoValidation.show), variacaoController.show);

//ADMIN
router.post("/", auth.required, LojaValidation.admin, Validation(VariacaoValidation.store), variacaoController.store);
router.put("/:id", auth.required, LojaValidation.admin, Validation(VariacaoValidation.update), variacaoController.update);
router.put("/images/:id", auth.required, LojaValidation.admin, upload.array("files", 4), Validation(VariacaoValidation.updateImages), variacaoController.updateImages);
router.delete("/:id", auth.required, LojaValidation.admin, Validation(VariacaoValidation.remove), variacaoController.remove);

module.exports = router;
