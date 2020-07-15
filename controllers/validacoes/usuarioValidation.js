const BaseJoi = require("joi");
const Extension = require("joi-date-extensions");
const Joi = BaseJoi.extend(Extension);

const UsuarioValidation = {
  login: {
    body: {
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }
  },
  show: {
    params: {
      id: Joi.string().alphanum().length(24).required()
    }
  },
  store: {
    body: {
      email: Joi.string().email().required(),
      nome: Joi.string().required(),
      password: Joi.string().required(),
      loja: Joi.string().alphanum().length(24).required()
    }
  },
  update: {
    body: {
      email: Joi.string().email().optional(),
      nome: Joi.string().optional(),
      password: Joi.string().optional()
    }
  }

}

module.exports = { UsuarioValidation }