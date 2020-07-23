const Joi = require("joi");

const EntregaValidation = {
  show: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
    },
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
  },
  update: {
    params: {
      id: Joi.string().alphanum().length(24).required(),
    },
    query: {
      loja: Joi.string().alphanum().length(24).required(),
    },
    body: {
      status: Joi.string().optional(),
      codigoRastreamento: Joi.string().optional(),
    },
  },
  calcular: {
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
      cep: Joi.string().required(),
    },
  },
};

module.exports = { EntregaValidation };
