const mongoose = require("mongoose");
const Loja = mongoose.model("Loja");

class LojaController {
  //GET "/"
  index(req, res, next) {
    Loja.find({})
      .select("_id nome cnpj email telefones endereco")
      .then((lojas) => {
        res.send({ lojas });
      })
      .catch(next);
  }

  //GET "/:id"
  show(req, res, next) {
    const { id } = req.params;
    Loja.findById(id)
      .select("_id nome cnpj email telefones endereco")
      .then((loja) => {
        if (!loja) return res.status(422).send({ errors: "Nenhuma Loja com Este Id" });
        res.send({ loja });
      })
      .catch(next);
  }

  //POST "/"
  store(req, res, next) {
    const { nome, cnpj, telefones, email, endereco } = req.body;

    const loja = new Loja({ nome, cnpj, telefones, email, endereco });
    loja
      .save()
      .then((loja) => {
        res.send({ loja });
      })
      .catch(next);
  }

  //PUT '/:id'
  update(req, res, next) {
    const { nome, cnpj, telefones, email, endereco } = req.body;
    const { id } = req.query;
    Loja.findById(id)
      .then((loja) => {
        if (!loja) return res.status(422).send({ errors: "Nenhuma Loja com Este Id" });
        if (typeof nome !== "undefined") loja.nome = nome;
        if (typeof cnpj !== "undefined") loja.cnpj = cnpj;
        if (typeof telefones !== "undefined") loja.telefones = telefones;
        if (typeof email !== "undefined") loja.email = email;
        if (typeof endereco !== "undefined") loja.endereco = endereco;

        loja
          .save()
          .then(() => {
            res.send({ loja });
          })
          .catch(next);
      })
      .catch(next);
  }

  //DELETE "/:id"
  remove(req, res, next) {
    const { loja } = req.query;
    Loja.findById(loja)
      .then((loja) => {
        if (!loja) return res.status(422).send({ errors: "Nenhuma Loja com Este Id" });
        loja
          .remove()
          .then(() => res.send({ deletado: true }))
          .catch(next);
      })
      .catch(next);
  }
}

module.exports = LojaController;
