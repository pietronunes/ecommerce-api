const router = require("express").Router();
const auth = require("../../auth");
const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");

const PedidosController = require("../../../controllers/PedidoController");

const pedidosController = new PedidosController();

// ROTAS PARA ADMIN
router.get("/admin", auth.required, LojaValidation.admin, pedidosController.indexAdmin);
router.get("/admin/:id", auth.required, LojaValidation.admin, pedidosController.showAdmin);
router.get("/admin/:id/carrinho", auth.required, LojaValidation.admin, pedidosController.showCarrinhoPedidoAdmin);
router.delete("/admin/:id", auth.required, LojaValidation.admin, pedidosController.removeAdmin);

//ROTAS PARA ENTREGA

//ROTAS PARA PAGAMENTO

//ROTAS PARA CLIENTES
router.get("/", auth.required, pedidosController.index);
router.get("/:id", auth.required, pedidosController.show);
router.get("/:id/carrinho", auth.required, pedidosController.showCarrinhoPedido);
router.delete("/:id", auth.required, pedidosController.remove);
router.post("/", auth.required, pedidosController.store);

module.exports = router;
