const router = require("express").Router();
const auth = require("../../auth");
const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");
const { PedidoValidation } = require("../../../controllers/validacoes/pedidoValidation");
const Validation = require("express-validation");

const PedidosController = require("../../../controllers/PedidoController");

const pedidosController = new PedidosController();

// ROTAS PARA ADMIN
router.get("/admin", auth.required, LojaValidation.admin, Validation(PedidoValidation.indexAdmin), pedidosController.indexAdmin);
router.get("/admin/:id", auth.required, LojaValidation.admin, Validation(PedidoValidation.showAdmin), pedidosController.showAdmin);
router.get(
  "/admin/:id/carrinho",
  auth.required,
  LojaValidation.admin,
  Validation(PedidoValidation.showCarrinhoPedidoAdmin),
  pedidosController.showCarrinhoPedidoAdmin
);
router.delete(
  "/admin/:id",
  auth.required,
  LojaValidation.admin,
  Validation(PedidoValidation.removeAdmin),
  pedidosController.removeAdmin
);

//ROTAS PARA ENTREGA

//ROTAS PARA PAGAMENTO

//ROTAS PARA CLIENTES
router.get("/", auth.required, Validation(PedidoValidation.index), pedidosController.index);
router.get("/:id", auth.required, Validation(PedidoValidation.show), pedidosController.show);
router.get("/:id/carrinho", auth.required, Validation(PedidoValidation.showCarrinhoPedido), pedidosController.showCarrinhoPedido);
router.delete("/:id", auth.required, Validation(PedidoValidation.remove), pedidosController.remove);
router.post("/", auth.required, Validation(PedidoValidation.store), pedidosController.store);

module.exports = router;
