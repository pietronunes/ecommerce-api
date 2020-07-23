const router = require("express").Router();
const ClienteController = require("../../../controllers/ClienteController");
const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");
const { ClienteValidation } = require("../../../controllers/validacoes/clienteValidation");
const Validation = require("express-validation");
const auth = require("../../auth");

const clienteController = new ClienteController();

//ADMIN
router.get("/", auth.required, LojaValidation.admin, Validation(ClienteValidation.index), clienteController.index); //checked

router.get(
  "/search/:search/pedidos",
  auth.required,
  LojaValidation.admin,
  Validation(ClienteValidation.searchPedidos),
  clienteController.searchPedidos
); //checked
router.get("/search/:search", auth.required, LojaValidation.admin, Validation(ClienteValidation.search), clienteController.search); //checked

router.get("/admin/:id", auth.required, LojaValidation.admin, Validation(ClienteValidation.showAdmin), clienteController.showAdmin); //checked

router.get(
  "/admin/:id/pedidos",
  auth.required,
  LojaValidation.admin,
  Validation(ClienteValidation.showPedidosCliente),
  clienteController.showPedidosCliente
); //checked

router.put(
  "/admin/:id",
  auth.required,
  LojaValidation.admin,
  Validation(ClienteValidation.updateAdmin),
  clienteController.updateAdmin
); //checked

//CLIENTES
router.get("/:id", auth.required, Validation(ClienteValidation.show), clienteController.show); //checked
router.post("/", Validation(ClienteValidation.store), clienteController.store); //checked
router.put("/:id", auth.required, Validation(ClienteValidation.update), clienteController.update); //checked
router.delete("/:id", auth.required, clienteController.remove); //checked

module.exports = router;
