const mongoose = require("mongoose");
const Cliente = mongoose.model("Cliente");
const Usuario = mongoose.model("Usuario");

class ClienteController {
  
  /**
   * 
   * ADMIN
  */

  //GET "/"
  async index(req,res,next){
    try {
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 30;
      const clientes = await Cliente.paginate(
        { loja: req.query.loja },
        { offset: offset, limit: limit, populate: {path: "usuario", select: "-salt -hash"} }
      )
      return res.send({ clientes });
    }catch(err) {
      next(err);
    }
  }

  //GET "/search/:search/pedidos"
  searchPedidos(req,res,next){
    return res.status(400).send({ errors: "Em Desenvolvimento" });
  }

  //GET "/search/:search"
  async search(req,res,next){
    try {
      const offset = Number(req.query.offset) || 0;
      const limit = Number(req.query.limit) || 30;
      const search = new RegExp(req.params.search, "i"); // pesquisa pelo param e "i" flag de pesquisa
      const clientes = await Cliente.paginate(
        { loja: req.query.loja, nome: { $regex: search } },
        { offset, limit, populate: {path: "usuario", select: "-salt -hash"}, }
      )
      return res.send({ clientes });
    }catch(err){
      next(err);
    }
  }

  //GET "/admin/:id"
  async showAdmin(req,res,next){
    try{
      const cliente = await Cliente.findOne({ _id: req.params.id, loja: req.query.loja }).populate({path: "usuario", select: "-salt -hash"});
      return res.send({ cliente });
    }catch(err){
      next(err);
    }
  }

  //GET "/admin/:id/pedidos"
  showPedidosCliente(req,res,next){
    return res.status(400).send({ errors: "Em Desenvolvimento" });
  }

  //PUT "/admin/:id"
  async updateAdmin(req,res,next){
    const { nome, cpf, email, telefones, endereco, dataDeNascimento } = req.body;
    try{
      const cliente = await Cliente.findById(req.params.id).populate({path: "usuario", select: "-salt -hash"});

      if(nome){
        cliente.usuario.nome = nome,
        cliente.nome = nome
      }
      if(cpf) cliente.cpf = cpf;
      if(email) cliente.usuario.email = email;
      if(telefones) cliente.telefones = telefones;
      if(endereco) cliente.endereco = endereco;
      if(dataDeNascimento) cliente.dataDeNascimento = dataDeNascimento;

      await cliente.usuario.save();
      await cliente.save()
      return res.send({ cliente });
    }catch(err){
      next(err);
    }
  }

  /**
   * 
   * CLIENTE
  */

  //GET "/:id"

  async show(req,res,next){
    try{
      const cliente = await Cliente.findOne({
        usuario: req.payload.id,
        loja: req.query.loja
      }).populate({path: "usuario", select: "-salt -hash"})
      
      return res.send({ cliente });
    }catch(err){
      next(err)
    }
  }

  //POST "/"
  async store(req,res,next){
    try{
      const { nome, email, cpf, telefones, endereco, dataDeNascimento, password} = req.body;
      const { loja } = req.query;

      const usuario = new Usuario({ nome, email, loja});
      usuario.setSenha(password);
      const cliente = new Cliente({ nome, cpf, telefones, endereco, loja, dataDeNascimento, usuario: usuario._id });

      await usuario.save();
      await cliente.save();
      
      return res.send({ cliente: Object.assign({}, cliente._doc, { email: usuario.email })}) //juntando 2 obj, "_doc" é porque foi salvo como paginação.
    }catch(err){
      next(err);
    }
  }

  //PUT "/:id"
  async update(req,res,next){
    const { nome, email, cpf, telefones, endereco, dataDeNascimento, password } = req.body;
    try{
      const cliente = await Cliente.findOne({ usuario: req.payload.id }).populate("usuario");
      if(!cliente) return res.send({ errors: "Cliente não existe" });
      if(nome){
        cliente.usuario.nome = nome
        cliente.nome = nome
      }
      if(email) cliente.usuario.email = email
      if(cpf) cliente.cpf = cpf
      if(telefones) cliente.telefones = telefones
      if(endereco) cliente.endereco = endereco
      if(dataDeNascimento) cliente.dataDeNascimento = dataDeNascimento
      if(password) cliente.usuario.setSenha(password)

      await cliente.usuario.save();
      await cliente.save();
      cliente.usuario = {
        email: cliente.usuario.email,
        _id: cliente.usuario._id,
        permissao: cliente.usuario.permissao
      }

      return res.send({ cliente });
    }catch(err){
      next(err)
    }
  }

  //DELETE "/:id"
  async remove(req,res,next){
    try{
      const cliente = await Cliente.findOne({ usuario: req.payload.id }).populate("usuario");
      if(!cliente) return res.send({ errors: "Cliente não existe" });
      
      await cliente.usuario.remove();

      cliente.deletado = true;
      await cliente.save();

      return res.send({ deletado: true })
    }catch(err){
      next(err);
    }
  }

}

module.exports = ClienteController;
