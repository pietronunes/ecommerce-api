const BaseJoi = require("joi");
const Extension = require("joi-date-extensions");
const Joi = BaseJoi.extend(Extension);

//VALIDAÇÕES PARA ADMIN JÁ VEM COM QUERY
const ProdutoValidation = {
  store: {
    body: {
      titulo: Joi.string().required() , 
      descricao: Joi.string().required(), 
      preco: Joi.number().required(), 
      promocao: Joi.number().optional(), 
      sku: Joi.string().required(), 
      categoria: Joi.string().alphanum().length(24).required()
    }
  },
  update: {
    params: {
      id: Joi.string().alphanum().length(24).required()
    },
    body: {
      titulo: Joi.string().optional() , 
      descricao: Joi.string().optional(), 
      preco: Joi.number().optional(), 
      promocao: Joi.number().optional(), 
      sku: Joi.string().optional(), 
      disponibilidade: Joi.boolean().optional(),
      categoria: Joi.string().alphanum().length(24).optional()
    }
  },
  updateImages: {
    params: {
      id: Joi.string().alphanum().length(24).required()
    }
  },
  remove: {
    params: {
      id: Joi.string().alphanum().length(24).required()
    }
  },
  index: {
    query: {
      offset: Joi.number().optional(),
      limit: Joi.number().optional(),
      loja: Joi.string().alphanum().length(24).required(),
      sortType: Joi.string().optional()
    }
  },
  indexDisponiveis: {
    query: {
      offset: Joi.number().optional(),
      limit: Joi.number().optional(),
      loja: Joi.string().alphanum().length(24).required(),
      sortType: Joi.string().optional()
    }
  },
  search: {
    query: {
      offset: Joi.number().optional(),
      limit: Joi.number().optional(),
      loja: Joi.string().alphanum().length(24).required(),
      sortType: Joi.string().optional()
    },
    params: {
      search: Joi.string().required()
    }
  },
  show: {
    params: {
      id: Joi.string().alphanum().length(24).required()   
    }
  },
  showAvaliacoes: {
    params: {
      id: Joi.string().alphanum().length(24).required()   
    }
  }
}

module.exports = { ProdutoValidation };