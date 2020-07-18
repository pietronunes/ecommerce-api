const mongoose = require("mongoose");
const { ClienteValidation } = require("./validacoes/clienteValidation");

const Produto = mongoose.model("Produto");
const Categoria = mongoose.model("Categoria");
const Avaliacao = mongoose.model("Avaliacao");
const Variacao = mongoose.model("Variacao");

const getSort = (sortType) =>{
  switch (sortType) {
    case "alfabetica_a-z":
      return { titulo: 1 };
    case "alfabetica_z-a":
      return { titulo: -1 }
    case "preco_crescente":
      return { preco: 1 }
    case "preco-decrescente":
      return { preco: -1 }
    default:
      return {};
  }
}



class ProdutoController {

  /****
   * ***
   * ADMIN
  */

  //POST "/" - STORE
  async store(req,res,next){
    const { titulo, descricao, preco, promocao, sku, categoria: categoriaId  } = req.body;
    const { loja } = req.query;

    try{
      const produto = new Produto({
        titulo,
        descricao,
        preco,
        disponibilidade: true,
        promocao,
        sku,
        categoria: categoriaId,
        loja
      });

      const categoria = await Categoria.findById(categoriaId);
      categoria.produtos.push(produto._id);

      await produto.save();
      await categoria.save();

      return res.send({ produto });
    }catch(err){
      next(err);
    }
  }

  //PUT "/:id" - update
  async update(req,res,next){
    const { titulo, descricao, preco, promocao, sku, categoria, disponibilidade  } = req.body;
    const { id } = req.params;
    
    try{
      const produto = await Produto.findById(id);
      if(!produto) return res.status(400).send({ errors: "Produto não encontrado" });

      if(titulo) produto.titulo = titulo;
      if(descricao) produto.descricao = descricao;
      if(preco) produto.preco = preco;
      if(promocao) produto.promocao = promocao;
      if(sku) produto.sku = sku;
      if(disponibilidade !== undefined) produto.disponibilidade = disponibilidade;

      if(categoria && categoria.toString() !== produto.categoria.toString()) {
        const oldCategoria = await Categoria.findById(produto.categoria);
        const newCategoria = await Categoria.findById(categoria);
        
        if(oldCategoria && newCategoria){
          oldCategoria.produtos = oldCategoria.produtos.filter(item => item.toString() !== produto._id.toString());
          newCategoria.produtos.push(produto._id);
          produto.categoria = categoria;
          await oldCategoria.save();
          await newCategoria.save();
        }else if(newCategoria){
          newCategoria.produtos.push(produto._id);
          produto.categoria = categoria;
          await newCategoria.save();
        }
      }

      await produto.save();

      return res.send({ produto });

    }catch(err){
      next(err);
    }
  }

  //PUT "/images/:id" - updateImages
  async updateImages(req,res,next){
    const { loja } = req.query
    try{
      const produto = await Produto.findOne({ _id: req.params.id, loja: loja });
      if(!produto) return res.status(400).send({ errors: "Produto não encontrado" });

      const novasImagens = req.files.map(item => item.filename);
      produto.fotos = produto.fotos.filter(item => item).concat(novasImagens); //filtra imagens caso sejam inválidas e coloca uma nova imagem no final do array

      await produto.save();
      return res.send({ produto });

    }catch(err){
      next(err);
    }
  }

  //DELETE "/:id" - Remove
  async remove(req,res,next){
    const { loja } = req.query;
    try{
      const produto = await Produto.findOne({ _id: req.params.id, loja: loja });
      if(!produto) return res.status(400).send({ errors: "Produto não encontrado" });

      const categoria = await Categoria.findById(produto.categoria);
      if(categoria) {
        categoria.produtos = categoria.produtos.filter(item => item.toString() !== produto._id.toString());
        console.log(categoria.produtos);
        await categoria.save();
      }

      await produto.remove();
      return res.send({ deletado: true });
    }catch(err){
      next(err);
    }
  }

  /****
   * ***
   * CLIENTES/VISITANTES
  */

  //GET "/" - index
  async index(req,res,next){
    try{
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 30;
      const { loja } = req.query;
      console.log(offset);
      console.log(limit)
      console.log(loja)

      const produtos = await Produto.paginate(
        { loja: loja },
        { offset: offset, limit: limit, sort: getSort(req.query.sortType) }
      );

      return res.send({ produtos });
    }catch(err){
      next(err);
    }
  }

  // "/disponiveis" - indexDisponiveis
  async indexDisponiveis(req,res,next){
    try{
      const offset = Number(req.query.offset) || 0;
      const limit  = Number(req.query.limit) || 30;
      const { loja } = req.query;

      const produtos = await Produto.paginate(
        { loja: loja, disponibilidade: true},
        { offset: offset, limit: limit, sort: getSort(req.query.sortType)}
      );

      return res.send({ produtos });
    }catch(err){
      next(err);
    }
  }

  // "/search/:search" - search
  async search(req,res,next){
    try{
      const  offset  = Number(req.query.offset) || 0;
      const  limit  = Number(req.query.limit) || 30;
      const { loja } = req.query;
      const search = new RegExp(req.params.search, "i");

      const produtos = await Produto.paginate(
        {
          loja: loja, 
          $or: [
            { "titulo": { $regex: search } },
            { "descricao": { $regex: search } },
            { "sku": { $regex: search } }
          ]
        },
        { offset: offset, limit: limit, sort: getSort(req.query.sortType) }
      )
      return res.send({ produtos });
    }catch(err){
      next(err);
    }
  }

  // GET "/:id" - Show
  async show(req,res,next) {
    try {
      const produto = await Produto
        .findById(req.params.id)
        .populate([
          //"avaliacoes", 
          //"variacoes", 
          "loja"
        ])
        
      if(!produto) return res.status(400).send({ errors: "Produto não encontrado" });
      return res.send({ produto });
    }catch(err){
      next(err);
    }
  }

  /****
   * ***
   * VARIACOES
  */
  //GET "/:id/variacoes" - showVariacoes
  async showVariacoes(req,res,next){
    const { idProduto } = req.params
    try{
      const variacoes = await Variacao.find({ produto: idProduto});
      if(!variacoes) return res.status(400).send({ errors: "Nenhuma Variação encontrada" });
      return res.send({ variacoes });
    }catch(err){
      next(err);
    }
  }


  /****
   * ***
   * AVALIACOES
  */

  //GET "/:id/avaliacoes" - showAvaliacoes
  async showAvaliacoes(req,res,next){
    try{
      const avaliacoes = await Avaliacao.find({ produto: req.params.id }) 
      return res.send({ avaliacoes });
    }catch(err){
      next(err);
    }
  }

}

module.exports = ProdutoController;