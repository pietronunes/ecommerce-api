const mongoose = require("mongoose");
const Categoria = mongoose.model("Categoria");
const Produto = mongoose.model("Produto");

class CategoriaController {
  
  //GET "/" index
  async index(req,res,next){
    try{
      const categorias = await Categoria.find({ 
        loja: req.query.loja 
      }).select(" _id produtos nome codigo loja");

      return res.send({ categorias })
    }catch(err){
      next(err);
    }
  }

  //GET "/disponiveis"
  async indexDisponiveis(req,res,next){
    try{
      const categoriasDisponiveis = await Categoria.find({
        loja: req.query.loja,
        disponibilidade: true
      }).select("_id produtos nome codigo loja");

      return res.send({ categoriasDisponiveis });
    }catch(err){
      next(err);
    }
  }

  //GET "/:id" show
  async show(req,res,next){
    const { id } = req.params
    try{
      const categoria = await Categoria.findOne({ 
        loja: req.query.loja,
        _id: id
      }).select("_id produtos nome codigo loja").populate(["produtos"]);

      if(!categoria) return res.send({ erros: "Categoria não encontrada"});

      return res.send({ categoria });
    }catch(err){
      next(err);
    }
  }

  // ADMIN ROUTES

  //POST "/" Store
  async store(req,res,next){
    const { nome, codigo } = req.body;
    const { loja } = req.query;
    try{
      const categoria = new Categoria({ nome, codigo, disponibilidade: true, loja });
      await categoria.save();
      return res.send({ categoria });
    }catch(err){
      next(err);
    }
  }

  //PUT "/:id" Update
  async update(req,res,next){
    const { nome, codigo, disponibilidade, produtos } = req.body;
    try{
      const categoria = await Categoria.findById(req.params.id);
      if(!categoria) return res.send({ errors: "Categoria não cadastrada" });

      if(nome) categoria.nome = nome;
      if(codigo) categoria.codigo = codigo;
      if(disponibilidade != undefined) categoria.disponibilidade = disponibilidade;
      if(produtos) categoria.produtos = produtos;

      await categoria.save();
      return res.send({ categoria });
    }catch(err){
      next(err);
    }
  }

  //DELETE "/:id" Remove
  async remove(req,res,next){
    try{
      const categoria = await Categoria.findById(req.params.id);
      if(!categoria) return res.send({ errors: "Categoria não cadastrada" });
      await categoria.remove();
      return res.send({ deletado: true })
    }catch(err){
      next(err);
    }
  }

  /**
   * 
   * PRODUTOS
  */

  //GET "/:id/produtos"
  async showProdutos(req,res,next){
    const { offset } = Number(req.query) || 0;
    const { limit } = Number(req.query) || 30;
    try{
      const produtos = await Produto.paginate(
        { categoria: req.params.id },
        { offset: offset, limit: limit }
      );
      return res.send({ produtos });
    }catch(err){
      next(err);
    }
  }

  //PUT "/:id/produtos"
  async updateProdutos(req,res,next){
    const { produtos } = req.body;
    try{
      const categoria = await Categoria.findById(req.params.id);
      if(produtos) categoria.produtos = produtos;
      await categoria.save();

      let _produtos = await Produto.find({ 
        $or:[
          { categoria: req.params.id },
          { _id: {$in: produtos } }
        ]
      });

      _produtos = await Promise.all(_produtos.map( async(produto) => {
        if(!produtos.include(produto._id)){
          produto.categoria = null
        } else {
          produto.categoria = req.params.id
        }
        await produto.save();
        return produto;
      }));

      const resultado = await Produto.paginate(
        { categoria: req.params.id },
        { offset: 0, limit: 30 }
      );
      
      return res.send({ produtos: resultado });

    }catch(err){
      next(err);
    }
  }

}

module.exports = CategoriaController;
