const mongoose = require("mongoose");

const Pedido = mongoose.model("Pedido");
const Produto = mongoose.model("Produto");
const Variacao = mongoose.model("Variacao");
const Cliente = mongoose.model("Cliente");
const Entrega = mongoose.model("Entrega");
const Pagamento = mongoose.model("Pagamento");

class PedidoController {
  /** @description
   * (pedidos.docs ---)
   *  Line: 31 -  38
   *  Line 31 - Este trecho de código está basicamente percorrento um array de objs
   *  (objs = Pedidos) e retornando no param "pedido" um obj (obj = cada Pedido)
   *  Line 33 - Percorrendo novamente um array de Obj (obj = produtos) e retornando
   *  no param "item" um obj (obj = cada Produto no carrinho)
   *  Line 34 - 35 - Procurando com os ids que estão no próprio produto todas as
   *  informações dele e retornando próprio item
   */

  // GET "/admin" - indexAdmin
  async indexAdmin(req, res, next) {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 30;
    try {
      const pedidos = await Pedido.paginate(
        { loja: req.query.loja },
        { offset, limit, populate: ["cliente", "pagamento", "entrega"] }
      );
      pedidos.docs = await Promise.all(
        pedidos.docs.map(async (pedido) => {
          pedido.carrinho = await Promise.all(
            pedido.carrinho.map(async (item) => {
              item.produto = await Produto.findById(item.produto);
              item.variacao = await Variacao.findById(item.variacao);
              return item;
            })
          );
          return pedido;
        })
      );
      return res.send({ pedidos });
    } catch (err) {
      next(err);
    }
  }

  // GET "/admin/:id" - showAdmin
  async showAdmin(req, res, next) {
    const { id } = req.params.id;
    const { loja } = req.query.loja;
    try {
      const pedido = await Pedido.findOne({ _id: id, loja }).populate(["cliente", "pagamento", "entrega"]);
      pedido.carrinho = await Promise.all(
        pedido.carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        })
      );
      return res.send({ pedido });
    } catch (err) {
      next(err);
    }
  }

  //REMOVE "/admin/:id" - removeAdmin
  async removeAdmin(req, res, next) {
    const { id } = req.params;
    const { loja } = req.query.loja;
    try {
      const pedido = await Pedido.findOne({ _id: id, loja });
      if (!pedido) return res.status(400).send({ errors: "Pedido não encontrado" });

      //REGISTRO DE ATIVIDADES = PEDIDO CANCELADO
      //ENVIAR EMAIL CLIENTE DE PEDIDO CANCELADO

      pedido.cancelado = true;
      await pedido.save();

      return res.send({ cancelado: true });
    } catch (err) {
      next(err);
    }
  }

  //GET "/admin/:id/carrinho" - showCarrinhoPedidoAdmin
  async showCarrinhoPedidoAdmin(req, res, next) {
    const { id } = req.params;
    const { loja } = req.query.loja;
    try {
      const pedido = await Pedido.findOne({ _id: id, loja });
      if (!pedido) return res.status(400).send({ errors: "Pedido não encontrado" });
      pedido.carrinho = await Promise.all(
        pedido.carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        })
      );
      return res.send({ carrinho: pedido.carrinho });
    } catch (err) {
      next(err);
    }
  }

  /**
   * CLIENTE/VISITANTE
   */

  //GET "/" - index
  async index(req, res, next) {
    const offset = Number(req.query.offset) || 0;
    const limit = Number(req.query.limit) || 30;
    const { loja } = req.query;
    try {
      const cliente = await Cliente.findOne({ usuario: req.payload.id });
      const pedidos = await Pedido.paginate(
        { loja: loja, cliente: cliente._id },
        { offset, limit, populate: ["cliente", "pagamento", "entrega"] }
      );
      pedidos.docs = Promise.all(
        pedidos.docs.map(async (pedido) => {
          pedido.carrinho = Promise.all(
            pedido.carrinho.map(async (item) => {
              item.produto = await Produto.findById(item.produto);
              item.variacao = await Variacao.findById(item.variacao);
              return item;
            })
          );
          return pedido;
        })
      );

      return res.send({ pedidos });
    } catch (err) {
      next(err);
    }
  }

  //GET "/:id" - show
  async show(req, res, next) {
    const { id } = req.body;
    try {
      const cliente = await Cliente.findOne({ usuario: req.payload.id });
      const pedido = await Pedido.findOne({ _id: id, cliente: cliente._id }).populate(["cliente", "entrega", "pagamento"]);

      pedido.carrinho = await Promise.all(
        pedido.carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        })
      );

      return res.send({ pedido });
    } catch (err) {
      next(err);
    }
  }

  //GET "/:id/carrinho" showCarrinhoPedido
  async showCarrinhoPedido(req, res, next) {
    const { id } = req.body;
    try {
      const cliente = await Cliente.findOne({ usuario: req.payload.id });
      const pedido = await Pedido.findOne({ _id: id, cliente: cliente._id });

      pedido.carrinho = await Promise.all(
        pedido.carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        })
      );

      return res.send({ carrinho: pedido.carrinho });
    } catch (err) {
      next(err);
    }
  }

  //REMOVE "/:id" - remove
  async remove(req, res, next) {
    const { id } = req.body;
    try {
      const cliente = await Cliente.findOne({ usuario: req.payload.id });
      const pedido = await Pedido.findOne({ _id: id, cliente: cliente._id });
      if (!pedido) return res.status(400).send({ errors: "Pedido não encontrado" });

      //REGISTRO DE ATIVIDADES = PEDIDO CANCELADO
      //ENVIAR EMAIL ADMIN DE PEDIDO CANCELADO

      pedido.cancelado = true;
      await pedido.save();
      return res.send({ cancelado: true });
    } catch (err) {
      next(err);
    }
  }

  //POST "/" - store
  async store(req, res, next) {
    const { carrinho, entrega, pagamento } = req.body; // OBJS COM INFORMAÇÕES PAGAMENTO, ENTREGA ETC
    const { loja } = req.query;
    try {
      const cliente = await Cliente.findOne({ usuario: req.payload.id });
      //CHECAR DADOS CARRINHO
      //if(!CarrinhoValidation(carrinho)) return res.status(422).send({ errors: "Carrinho Inválido" });

      //CHECAR DADOS ENTREGA
      //if(!EntregaValidation(carrinho, entrega)) return res.status(422).send({ errors: "Dados de Entrega Inválidos" });

      //CHECAR DADOS PAGAMENTO
      //if(!PagamentoValidation(carrinho, pagamento)) return res.status(422).send({ errors: "Dados de Pagamento Inválidos" });

      // CRIANDO NOVO PAGAMENTO
      const novoPagamento = new Pagamento({
        valor: pagamento.valor,
        forma: pagamento.forma,
        status: "iniciando",
        payload: pagamento,
        loja: loja,
      });

      // CRIANDO NOVA ENTREGA
      const novaEntrega = new Entrega({
        status: "nao_iniciada",
        custo: entrega.custo,
        prazo: entrega.prazo,
        payload: entrega,
        loja: loja,
      });

      const pedido = new Pedido({
        cliente: cliente._id,
        carrinho: carrinho,
        entrega: novaEntrega._id,
        pagamento: novoPagamento._id,
        loja: loja,
      });

      novoPagamento.pedido = pedido._id;
      novaEntrega.pedido = pedido._id;

      await pedido.save();
      await novoPagamento.save();
      await novaEntrega.save();

      // Notificar via email - cliente e admin - novo pedido;

      // Retorna um obj mais completo com info de pagamentos/entrega
      return res.send({ pedido: Object.assign({}, pedido, { entrega: novaEntrega, pagamento: novoPagamento }) });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PedidoController;
