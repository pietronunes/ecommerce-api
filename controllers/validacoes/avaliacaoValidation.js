const BaseJoi = require("joi");
const Extension = require("joi-date-extensions");
const Joi = BaseJoi.extend(Extension);

const AvaliacaoValidation = {
  index: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
      produto: Joi.string().alphanum().length(24).required()
    }
  },
  show: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
      produto: Joi.string().alphanum().length(24).required()
    },
    params: {
      id: Joi.string().alphanum().length(24).required()
    }
  },
  store: {
    query: {
      loja: Joi.string().alphanum().length(24).required(),
      produto: Joi.string().alphanum().length(24).required()
    },
    body: {
      nome: Joi.string().required(),
      texto: Joi.string().required(),
      pontuacao: Joi.string().min(1).max(5).required()
    }
  },
  remove: {
    params: {
      id: Joi.string().alphanum().length(24).required()
    }
  }
}

module.exports = { AvaliacaoValidation };