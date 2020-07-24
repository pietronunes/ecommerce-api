const mongoose = require("mongoose");
const { calcularFrete } = require("./integracoes/correios");

const Entrega = mongoose.model("Entrega");
const Produto = mongoose.model("Produto");
const Variacao = mongoose.model("Variacao");
const RegistroPedido = mongoose.model("RegistroPedido");

class EntregaController {
  // GET "/:id" - show
  async show(req, res, next) {
    const { id } = req.params;
    const { loja } = req.query;
    try {
      const entrega = await Entrega.findOne({ _id: id, loja });
      const registro = await RegistroPedido.find({ pedido: entrega.pedido, tipo: "entrega" });
      return res.send({ entrega, registro });
    } catch (err) {
      next(err);
    }
  }

  // PUT "/:id" - update
  async update(req, res, next) {
    const { status, codigoRastreamento } = req.body;
    const { loja } = req.query;
    try {
      const entrega = await Entrega.findOne({ _id: req.params.id, loja });
      if (!entrega) return res.status(400).send({ errors: "Entrega não encontrada" });
      if (status) entrega.status = status;
      if (codigoRastreamento) entrega.codigoRastreamento = codigoRastreamento;

      const registro = new RegistroPedido({
        pedido: entrega.pedido,
        tipo: "entrega",
        situacao: status,
        payload: req.body,
      });

      await entrega.save();
      await registro.save();
      return res.send({ entrega, registro });
    } catch (err) {
      next(err);
    }
  }

  //POST "/calcular" - calcular
  async calcular(req, res, next) {
    const { cep, carrinho } = req.body;
    try {
      const _carinho = await Promise.all(
        carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        })
      );
      const resultados = await calcularFrete({ cep, produtos: _carinho });
      return res.send({ resultados });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = EntregaController;
