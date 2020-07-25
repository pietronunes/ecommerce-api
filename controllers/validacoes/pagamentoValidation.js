const Joi = require("joi");

const mongoose = require("mongoose");

const Produto = mongoose.model("Produto");
const Variacao = mongoose.model("Variacao");

const PagamentoValidation = {
  show: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
    },
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
  },
  pagar: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
    },
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
    body: {
      senderHash: Joi.string().required(),
    },
  },
  update: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
    },
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
    body: {
      status: Joi.string().optional(),
    },
  },
};

const checarValorTotal = async ({ carrinho, entrega, pagamento }) => {
  try {
    const _carrinho = await Promise.all(
      carrinho.map(async (item) => {
        item.produto = await Produto.findById(item.produto);
        item.variacao = await Variacao.findById(item.variacao);
        return item;
      })
    );

    //Entrega já vem com valor validado, atribuimos ela ao valor total no incicio;
    let valorTotal = entrega.custo;
    valorTotal += _carrinho.reduce(
      (all, item) => all + (item.quantidade * item.precoUnitario, 0)
    );

    if (
      valorTotal.toFixed() === pagamento.valor.toFixed() &&
      (!pagamento.parcelas || pagamento.parcelas <= 6) // se não existir parcelas e parcelas menor igual 6
    ) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log(err);
    return false;
  }
};

const checarDadosCartao = (pagamento) => {
  if (pagamento.forma === "creditCard") {
    return (
      pagamento.cartao.nomeCompleto &&
      typeof pagamento.cartao.nomeCompleto === "string" &&
      pagamento.cartao.codigoArea &&
      typeof pagamento.cartao.codigoArea === "string" &&
      pagamento.cartao.telefone &&
      typeof pagamento.cartao.telefone === "string" &&
      pagamento.cartao.dataDeNascimento &&
      typeof pagamento.cartao.dataDeNascimento === "string" &&
      pagamento.cartao.credit_card_token &&
      typeof pagamento.cartao.credit_card_token === "string" &&
      pagamento.cartao.cpf &&
      typeof pagamento.cartao.cpf === "string"
    );
  } else if (pagamento.forma === "boleto") return true;
  else return false;
};

module.exports = {
  PagamentoValidation,
  checarValorTotal,
  checarDadosCartao,
};
