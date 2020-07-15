const router = require("express").Router();
const auth = require("../../auth");
const UsuariosController = require("../../../controllers/UsuarioController");
const Validation = require('express-validation');
const { UsuarioValidation } = require('../../../controllers/validacoes/usuarioValidation');

const usuarioController = new UsuariosController();

router.post("/login", Validation(UsuarioValidation.login) , usuarioController.login); //checked
router.post("/registrar", Validation(UsuarioValidation.store), usuarioController.store); //checked
router.put("/", auth.required, Validation(UsuarioValidation.update), usuarioController.update); //checked
router.delete("/", auth.required, usuarioController.remove); //checked

router.get("/recuperar-senha", usuarioController.showRecovery); //checked
router.post("/recuperar-senha", usuarioController.createRecovery); // checked
router.get("/senha-recuperada", usuarioController.showCompleteRecovery); //checked
router.post("/senha-recuperada", usuarioController.completeRecovery); // checked

router.get("/", auth.required, usuarioController.index); //checked
router.get("/:id", auth.required, Validation(UsuarioValidation.show), usuarioController.show); //checked

module.exports = router;
