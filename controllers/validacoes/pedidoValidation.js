const BaseJoi = require("joi");
const Extension = require("joi-date-extensions");
const Joi = BaseJoi.extend(Extension);

const PedidoValidation = {
  indexAdmin: {
    query: {
      offset: Joi.number().optional(),
      limit: Joi.number().optional(),
    },
  },
  showAdmin: {
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
  },
  removeAdmin: {
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
  },
  showCarrinhoPedidoAdmin: {
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
  },
  index: {
    query: {
      offset: Joi.number().optional(),
      limit: Joi.number().optional(),
      loja: Joi.string().alphanum().length(24).required(),
    },
  },
  show: {
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
  },
  showCarrinhoPedido: {
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
  },
  remove: {
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
  },
  store: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
    },
    body: {
      carrinho: Joi.array()
        .items(
          Joi.object({
            produto: Joi.string().alphanum().length(24).required(),
            variacao: Joi.string().alphanum().length(24).required(),
            precoUnitario: Joi.number().required(),
            quantidade: Joi.number().required(),
          })
        )
        .required(),
      entrega: Joi.object({
        custo: Joi.number().required(),
        prazo: Joi.number().required(),
        tipo: Joi.string().required(),
      }).required(),
      pagamento: Joi.object({
        valor: Joi.number().required(),
        forma: Joi.string().required(),
      }).required(),
    },
  },
};

module.exports = { PedidoValidation };
