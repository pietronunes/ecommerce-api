const mongoose = require("mongoose");

const Pedido = mongoose.model("Pedido");
const Produto = mongoose.model("Produto");
const Variacao = mongoose.model("Variacao");
const Cliente = mongoose.model("Cliente");
const Entrega = mongoose.model("Entrega");
const Pagamento = mongoose.model("Pagamento");
const RegistroPedido = mongoose.model("RegistroPedido");

const CarrinhoValidation = require("./validacoes/carrinhoValidation");
const PagamentoValidation = require("./validacoes/pagamentoValidation");
const EntregaValidation = require("./validacoes/entregaValidation");

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
    const { loja } = req.query;
    try {
      const pedido = await Pedido.findOne({ _id: req.params.id, loja }).populate([
        "cliente",
        "pagamento",
        "entrega",
      ]);
      pedido.carrinho = await Promise.all(
        pedido.carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        })
      );
      const registro = await RegistroPedido.find({ pedido: pedido._id });

      return res.send({ pedido, registro });
    } catch (err) {
      next(err);
    }
  }

  //REMOVE "/admin/:id" - removeAdmin
  async removeAdmin(req, res, next) {
    const { id } = req.params;
    const { loja } = req.query;
    try {
      const pedido = await Pedido.findOne({ _id: id, loja });
      if (!pedido) return res.status(400).send({ errors: "Pedido não encontrado" });

      //ENVIAR EMAIL CLIENTE DE PEDIDO CANCELADO

      pedido.cancelado = true;
      await pedido.save();

      //REGISTRO DE ATIVIDADES = PEDIDO CANCELADO
      const registroPedido = new RegistroPedido({
        pedido: pedido._id,
        tipo: "pedido",
        situacao: "pedido_cancelado",
      });

      await registroPedido.save();

      return res.send({ cancelado: true });
    } catch (err) {
      next(err);
    }
  }

  //GET "/admin/:id/carrinho" - showCarrinhoPedidoAdmin
  async showCarrinhoPedidoAdmin(req, res, next) {
    const { id } = req.params;
    const { loja } = req.query;
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
      pedidos.docs = await Promise.all(
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
    const { id } = req.params;
    try {
      const cliente = await Cliente.findOne({ usuario: req.payload.id });
      const pedido = await Pedido.findOne({ _id: id, cliente: cliente._id }).populate([
        "cliente",
        "entrega",
        "pagamento",
      ]);

      pedido.carrinho = await Promise.all(
        pedido.carrinho.map(async (item) => {
          item.produto = await Produto.findById(item.produto);
          item.variacao = await Variacao.findById(item.variacao);
          return item;
        })
      );

      const registro = await RegistroPedido.find({ pedido: pedido._id });

      return res.send({ pedido, registro });
    } catch (err) {
      next(err);
    }
  }

  //GET "/:id/carrinho" showCarrinhoPedido
  async showCarrinhoPedido(req, res, next) {
    const { id } = req.params;
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
    const { id } = req.params;
    try {
      const cliente = await Cliente.findOne({ usuario: req.payload.id });
      const pedido = await Pedido.findOne({ _id: id, cliente: cliente._id });
      if (!pedido) return res.status(400).send({ errors: "Pedido não encontrado" });
      //ENVIAR EMAIL ADMIN DE PEDIDO CANCELADO

      pedido.cancelado = true;
      await pedido.save();

      //REGISTRO DE ATIVIDADES = PEDIDO CANCELADO
      const registroPedido = new RegistroPedido({
        pedido: pedido._id,
        tipo: "pedido",
        situacao: "pedido_cancelado",
      });
      await registroPedido.save();

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
      const cliente = await (await Cliente.findOne({ usuario: req.payload.id })).populate(
        "Usuario"
      );
      //CHECAR DADOS CARRINHO
      if (!(await CarrinhoValidation(carrinho)))
        return res.status(422).send({ errors: "Carrinho Inválido" });

      //CHECAR DADOS ENTREGA
      if (
        !(await EntregaValidation.checkValorPrazo(
          cliente.endereco.CEP,
          carrinho,
          entrega
        ))
      )
        return res.status(422).send({ errors: "Dados de Entrega Inválidos" });

      //CHECAR DADOS PAGAMENTO
      if (!(await PagamentoValidation.checarValorTotal({ carrinho, entrega, pagamento })))
        return res.status(422).send({ errors: "Dados de Pagamento Inválidos" });

      if (!PagamentoValidation.checarDadosCartao(pagamento))
        return res.status(422).send({ errors: "Dados do Cartão Inválidos" });

      // CRIANDO NOVO PAGAMENTO
      const novoPagamento = new Pagamento({
        valor: pagamento.valor,
        parcelas: pagamento.parcelas || 1,
        forma: pagamento.forma,
        status: "iniciando",
        endereco: pagamento.endereco,
        cartao: pagamento.cartao,
        enderecoEntregaIgualCobranca: pagamento.enderecoEntregaIgualCobranca,
        loja: loja,
      });

      // CRIANDO NOVA ENTREGA
      const novaEntrega = new Entrega({
        status: "nao_iniciada",
        custo: entrega.custo,
        prazo: entrega.prazo,
        tipo: entrega.tipo,
        endereco: entrega.endereco,
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

      //REGISTRO DE ATIVIDADES = PEDIDO CRIADO
      const registroPedido = new RegistroPedido({
        pedido: pedido._id,
        tipo: "pedido",
        situacao: "pedido_criado",
      });

      await registroPedido.save();

      // Retorna um obj mais completo com info de pagamentos/entrega
      return res.send({
        pedido: Object.assign({}, pedido._doc, {
          entrega: novaEntrega,
          pagamento: novoPagamento,
        }),
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = PedidoController;
