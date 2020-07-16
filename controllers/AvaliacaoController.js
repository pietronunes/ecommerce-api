const mongoose = require("mongoose");
const Avaliacao = mongoose.model("Avaliacao");
const Produto = mongoose.model("Produto");

class AvaliacaoController {
  
  /**
   * 
   * CLIENTES/VISITANTES
  */

  //GET "/" - index
  async index(req,res,next){
    const { produto, loja } = req.query
    try{
      const avaliacoes = await Avaliacao.find({ produto: produto, loja: loja });
      if(!avaliacoes) return res.status(400).send({ errors: "Nenhuma Avaliação encontrada" });

      return res.send({ avaliacoes });
    }catch(err){
      next(err);
    }
  }

  //GET "/:id" - show
  async show(req,res,next){
    try{
      const avaliacao = await Avaliacao.findOne({
        _id: req.params.id,
        produto: req.query.produto,
        loja: req.query.loja
      })

      return res.send({ avaliacao })
    }catch(err){
      next(err);
    }
  }

  //POST "/" - store
  async store(req,res,next){
    const { nome, texto, pontuacao } = req.body
    try{
      const avaliacao = new Avaliacao({
        nome,
        texto,
        pontuacao,
        loja: req.query.loja,
        produto: req.query.produto
      })

      const _produto = await Produto.findById(req.query.produto);
      _produto.avaliacoes.push(avaliacao._id);

      await _produto.save();
      await avaliacao.save();

      return res.send({ avaliacao });
    }catch(err){
      next(err)
    }
  }

  /**
   * 
   * ADMIN
  */

  //DELETE "/:id" - remove
  async remove(req,res,next){
    try{
      const avaliacao = await Avaliacao.findById(req.params.id);
      const produto = await Produto.findById(avaliacao.produto);

      produto.avaliacoes = produto.avaliacoes.filter(item => item.toString() !== avaliacao._id.toString());
      await produto.save();
      await avaliacao.remove();

      return res.send({ deletado: true });
    }catch(err){
      next(err);
    }
  }
}

module.exports = AvaliacaoController;
