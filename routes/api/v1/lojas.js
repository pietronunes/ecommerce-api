const router = require("express").Router();
const auth = require("../../auth");
const LojaController = require("../../../controllers/LojaController");

const Validation = require("express-validation");
const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");

const lojaController = new LojaController();

router.get("/", lojaController.index); //checked
router.get("/:id", Validation(LojaValidation.show), lojaController.show); //checked

router.post("/", auth.required, Validation(LojaValidation.store), lojaController.store); //checked
router.put("/:id", auth.required, LojaValidation.admin, Validation(LojaValidation.update) ,lojaController.update); //checked
router.delete("/:id", auth.required, LojaValidation.admin, lojaController.remove); //checked

module.exports = router;
