const mongoose = require("mongoose");
const {
  getNotification,
  getSessionId,
  criarPagamento,
  getTransactionStatus,
} = require("./integracoes/pagseguro");

const Pagamento = mongoose.model("Pagamento");
const Pedido = mongoose.model("Pedido");
const Produto = mongoose.model("Produto");
const Variacao = mongoose.model("Variacao");
const RegistroPedido = mongoose.model("RegistroPedido");

class PagamentoController {
  /**
   * CLIENTES
   */

  //GET "/:id" - show
  async show(req, res, next) {
    const { id: _id } = req.params.id;
    try {
      const pagamento = await Pagamento.findOne({ _id, loja: req.query.loja });
      if (!pagamento) return res.status(400).send({ errors: "Pagamento não encontrado" });

      const registros = await RegistroPedido.find({
        pedido: pagamento.pedido,
        tipo: "pagamento",
      });

      const situacao = pagamento.pagSeguroCode // Se existir o code (pagamento iniciado)
        ? await getTransactionStatus(pagamento.pagSeguroCode) // Chamamos o status da transação
        : null;

      if (
        situacao && // existe um retorno de situacao
        (registros.length === 0 || // não há registros
          registros[registros.length - 1].payload.code !== situacao.code)
      ) {
        const registroPedido = new RegistroPedido({
          pedido: pagamento.pedido,
          tipo: "pagamento",
          situacao: situacao.status || "Situacao",
          payload: situacao,
        });

        pagamento.status = situacao.status;
        await pagamento.save();
        await registroPedido.save();
        registros.push(registroPedido);
      }

      return res.send({ pagamento, registros, situacao });
    } catch (err) {
      next(err);
    }
  }

  //POST "/pagar/:id" - pagar]
  async pagar(req, res, next) {
    const { senderHash } = req.body; // código transação do Front
    const { id: _id } = req.params.id;
    try {
      const pagamento = await Pagamento.findOne({ _id, loja: req.query.loja });
      if (!pagamento) return res.status(400).send({ errors: "Pagamento não encontrado" });

      const pedido = await Pedido.findById(pagamento.pedido).populate([
        { path: "cliente", populate: "usuario" },
        { path: "entrega" },
        { path: "pagamento" },
      ]);

      pedido.carrinho = await Promise.all(
        pedido.carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        })
      );

      const payload = await criarPagamento(senderHash, pedido); // Criando Pagamento
      pagamento.payload = pagamento.payload
        ? pagamento.payload.concat([payload])
        : [payload]; // Se existir payload concatena se não add um novo

      if (payload.code) pagamento.pagSeguroCode = payload.code;

      await pagamento.save();

      return res.send({ pagamento, payload });
    } catch (err) {
      next(err);
    }
  }

  /**
   * ADMIN
   */

  //PUT "/:id" - Update
  async update(req, res, next) {
    const { status } = req.body;
    const { id: _id } = req.body;
    try {
      const pagamento = await Pagamento.findOne({ _id, loja: req.query.loja });
      if (!pagamento) return res.status(400).send({ errors: "Pagamento não encontrado" });

      if (status) pagamento.status = status;

      const registro = new RegistroPedido({
        pedido: pagamento.pedido,
        tipo: "pagamento",
        situacao: status,
      });

      await registro.save();
      //Enviar email de atualização do status pedido para cliente
      await pagamento.save();

      return res.send({ pagamento });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PAGSEGURO
   */

  // GET "/session" - getSessionId
  async getSessionId(req, res, next) {
    try {
      const sessionId = await getSessionId();
      return res.send({ sessionId });
    } catch (err) {
      next(err);
    }
  }

  //POST "/notificacao" - notificacao
  async verNotificacao(req, res, next) {
    try {
      const { notificationCode, notificationType } = req.body;
      if (notificationType !== "transaction") return res.send({ success: true });
      const result = await getNotification(notificationCode);

      const pagamento = await Pagamento.findOne({ pagSeguroCode: result.code });
      if (!pagamento) return res.status(400).send({ errors: "Pagamento não encontrado" });

      const registros = await RegistroPedido.find({
        pedido: pagamento.pedido,
        tipo: "pagamento",
      });

      const situacao = pagamento.pagSeguroCode
        ? await getTransactionStatus(pagamento.pagSeguroCode)
        : null;

      if (
        situacao && // existe um retorno de situacao
        (registros.length === 0 || // não há registros
          registros[registros.length - 1].payload.code !== situacao.code)
      ) {
        const registroPedido = new RegistroPedido({
          pedido: pagamento.pedido,
          tipo: "pagamento",
          situacao: situacao.status || "Situação",
          payload: situacao,
        });
        pagamento.status = situacao.status;
        await registroPedido.save();
        await pagamento.save();
      }

      return res.send({ success: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PagamentoController;
