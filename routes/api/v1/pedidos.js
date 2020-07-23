const router = require("express").Router();
const auth = require("../../auth");
const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");
const { PedidoValidation } = require("../../../controllers/validacoes/pedidoValidation");
const Validation = require("express-validation");

const PedidosController = require("../../../controllers/PedidoController");

const pedidosController = new PedidosController();

// ROTAS PARA ADMIN
router.get("/admin", auth.required, LojaValidation.admin, Validation(PedidoValidation.indexAdmin), pedidosController.indexAdmin); //checked
router.get("/admin/:id", auth.required, LojaValidation.admin, Validation(PedidoValidation.showAdmin), pedidosController.showAdmin); //checked
router.get(
  "/admin/:id/carrinho",
  auth.required,
  LojaValidation.admin,
  Validation(PedidoValidation.showCarrinhoPedidoAdmin),
  pedidosController.showCarrinhoPedidoAdmin
); //checked
router.delete(
  "/admin/:id",
  auth.required,
  LojaValidation.admin,
  Validation(PedidoValidation.removeAdmin),
  pedidosController.removeAdmin
); //checked

//ROTAS PARA ENTREGA

//ROTAS PARA PAGAMENTO

//ROTAS PARA CLIENTES
router.get("/", auth.required, Validation(PedidoValidation.index), pedidosController.index); //checked
router.get("/:id", auth.required, Validation(PedidoValidation.show), pedidosController.show); //checked
router.get("/:id/carrinho", auth.required, Validation(PedidoValidation.showCarrinhoPedido), pedidosController.showCarrinhoPedido); //checked
router.delete("/:id", auth.required, Validation(PedidoValidation.remove), pedidosController.remove); //checked
router.post("/", auth.required, Validation(PedidoValidation.store), pedidosController.store); //checked

module.exports = router;
