const router = require("express").Router();

const auth = require("../../auth");
const { LojaValidation } = require("../../../controllers/validacoes/lojaValidation");
const {
  PagamentoValidation,
} = require("../../../controllers/validacoes/pagamentoValidation");
const Validation = require("express-validation");

const PagamentoController = require("../../../controllers/PagamentoController");

const pagamentoController = new PagamentoController();

// TESTES
if (process.env.NODE_ENV !== "production") {
  router.get("/tokens", (req, res) => {
    res.render("pagseguro/index");
  });
}

// PAGSEGURO
router.post("/notificacao", pagamentoController.verNotificacao);
router.get("/session", pagamentoController.getSessionId);

// CLIENTES
router.get(
  "/:id",
  auth.required,
  Validation(PagamentoValidation.show),
  pagamentoController.show
);
router.post(
  "/pagar/:id",
  auth.required,
  Validation(PagamentoValidation.pagar),
  pagamentoController.pagar
);

//ADMIN
router.put(
  "/:id",
  auth.required,
  LojaValidation.admin,
  Validation(PagamentoValidation.update),
  pagamentoController.update
);

module.exports = router;
