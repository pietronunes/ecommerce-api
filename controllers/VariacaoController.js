const mongoose = require("mongoose");

const Variacao = mongoose.model("Variacao");
const Produto = mongoose.model("Produto");

class VariacaoController {
  /**
   *
   * CLIENTE/VISITANTES
   */

  //GET "/" - index
  async index(req, res, next) {
    const { loja, produto } = req.query;
    try {
      const variacoes = await Variacao.find({ loja: loja, produto: produto });
      return res.send({ variacoes });
    } catch (err) {
      next(err);
    }
  }

  //GET "/:id" - show
  async show(req, res, next) {
    const { loja, produto } = req.query;
    const { id } = req.params;
    try {
      const variacao = await Variacao.findOne({ _id: id, produto: produto, loja: loja });
      return res.send({ variacao });
    } catch (err) {
      next(err);
    }
  }

  /**
   *
   * ADMIN
   */

  //POST "/" - store
  async store(req, res, next) {
    const { loja, produto: idproduto } = req.query;
    const { codigo, nome, preco, promocao, entrega, quantidade } = req.body;
    try {
      const variacao = new Variacao({
        codigo,
        nome,
        preco,
        promocao,
        entrega,
        quantidade,
        loja: loja,
        produto: idproduto,
      });
      const produto = await Produto.findOne({ _id: idproduto });
      if (!produto) return res.status(400).send({ errors: "Produto inexistente" });
      produto.variacoes.push(variacao._id);

      await produto.save();
      await variacao.save();
      return res.send({ variacao });
    } catch (err) {
      next(err);
    }
  }

  //PUT "/:id" - update
  async update(req, res, next) {
    const { codigo, fotos, nome, preco, promocao, entrega, quantidade } = req.body;
    try {
      const variacao = await Variacao.findOne({ _id: req.params.id });
      if (!variacao) return res.status(400).send({ errors: "Variação inexistente" });

      if (codigo) variacao.codigo = codigo;
      if (nome) variacao.nome = nome;
      if (preco) variacao.preco = preco;
      if (promocao) variacao.promocao = promocao;
      if (entrega) variacao.entrega = entrega;
      if (quantidade) variacao.quantidade = quantidade;
      if (fotos) variacao.fotos = fotos;

      await variacao.save();
      return res.send({ variacao });
    } catch (err) {
      next(err);
    }
  }

  //PUT "/images/:id" - updateImages
  async updateImages(req, res, next) {
    const { loja } = req.query;
    try {
      const variacao = await Variacao.findOne({ _id: req.params.id, loja: loja });
      if (!variacao) return res.status(400).send({ errors: "Variação inexistente" });

      const novasImagens = req.files.map((item) => item.filename);
      variacao.fotos = variacao.fotos.filter((item) => item).concat(novasImagens);
      await variacao.save();

      return res.send({ variacao });
    } catch (err) {
      next(err);
    }
  }

  //REMOVE "/:id" - remove
  async remove(req, res, next) {
    try {
      const variacao = await Variacao.findById(req.params.id);
      if (!variacao) return res.status(400).send({ errors: "Variação inexistente" });

      const produto = await Produto.findById(variacao.produto);
      produto.variacoes = produto.variacoes.filter((item) => item.toString() !== variacao._id.toString());

      await produto.save();
      await variacao.remove();

      res.send({ deletado: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = VariacaoController;
