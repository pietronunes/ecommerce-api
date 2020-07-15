const mongoose = require("mongoose");
const Usuario = mongoose.model("Usuario");
const enviarEmailRecovery = require("../helpers/enviarEmailRecovery");
const clientes = require("../models/clientes");

class UsuarioController {
  // GET "/"
  index(req,res,next){
    Usuario.findById(req.payload.id).then(usuario => {
      if(!usuario) return res.json(401).json({ errors: "Usuário não registrado" });
      return res.json({ usuario: usuario.enviarAuthJSON()})
    }).catch(err => {
      console.log(err);
    });
  }

  // GET "/:id"
  show(req,res,next){
    Usuario.findById(req.params.id).then(usuario => {
      if(!usuario) return res.json(401).json({ errors: "Usuário não registrado" });
      return res.json({
        usuario: {
          nome: usuario.nome,
          email: usuario.email,
          permissao: usuario.permissao,
          loja: usuario.loja
        }
      });
    }).catch(next);
  }

  //POST "/register"
  store(req,res,next){
    const { email, nome, password, loja } = req.body;
  
    const usuario = new Usuario({ email, nome, loja });
    usuario.setSenha(password);
    usuario.save()
    .then(() => res.json({ usuario: usuario.enviarAuthJSON() }) )
    .catch(next);  
  }
  
  //PUT "/"
  update(req,res,next){
    const { email, nome, password } = req.body;

    Usuario.findById(req.payload.id).then(usuario => {
      if(!usuario) return res.json(401).json({ errors: "Usuário não registrado" });
      if(typeof email != "undefined") usuario.email = email;
      if(typeof nome != "undefined") usuario.nome = nome;
      if(typeof password != "undefined") usuario.setSenha(password);
      return usuario.save().then(() => {
        return res.json({ usuario: usuario.enviarAuthJSON() })
      }).catch(next);
    }).catch(next)
  }

  //DELETE "/remove"
  remove(req,res,next){
    Usuario.findById(req.payload.id).then(usuario => {
      if(!usuario) return res.json(401).json({ errors: "Usuário não registrado" });
      return usuario.remove().then(() => { 
        return res.json({ deletado: true })
      }).catch(next);
    }).catch(next);
  }

  //POST "/login"
  login(req,res,next){
    const { email, password } = req.body;

    Usuario.findOne({ email }).then(usuario => {
      if(!usuario) return res.status(401).json({ errors: "Usuário não registrado" });
      if(!usuario.validarSenha(password)) return res.status(401).json({ errors: "Senha Inválida" });
      return res.json({ usuario: usuario.enviarAuthJSON() });
    }).catch(next);
  }

  //RECUPERAÇÃO DE SENHA

  //GET "/recuperar-senha"
  showRecovery(req,res,next){
    return res.render("recovery", { errors: null, success: null });
  }

  //POST "/recuperar-senha"
  createRecovery(req,res,next){
    const { email } = req.body;
    if(!email) return res.render("recovery", { errors: "Você precisa digitar o email", success: null });

    Usuario.findOne({ email }).then(usuario => {
      if(!usuario) return res.render("recovery", { errors: "Usuário não cadastrado", success: null });
      const recoveryData = usuario.criarTokenRecuperacaoSenha();
      usuario.save().then(() => {
        enviarEmailRecovery({ usuario, recovery: recoveryData }, (errors = null, success = null) => {
          return res.render("recovery", { errors: errors, success: success });
        });
      }).catch(next);
    }).catch(next);
  }

  //GET "/senha-recuperada"
  showCompleteRecovery(req,res,next){
    if(!req.query.token) return res.render("recovery", { errors: "Token não identificado", success: null });

    Usuario.findOne({ "recovery.token": req.query.token }).then(usuario => {
  
      if(!usuario) return res.render("recovery", { errors: "Nenhum usuário com este token", success: null });
      if(new Date(usuario.recovery.date) < new Date()) return res.render("recovery", { errors: "Token Expirado", success: null});
      return res.render("recovery/store", { errors:null, success:null, token: req.query.token });
    }).catch(next);
  }

  //POST "/senha-recuperada"
  completeRecovery(req,res,next){
    const { password,token } = req.body;
    if(!token || !password) return res.render("recovery/store", { errors: "Preencha novamente com sua senha", success: null });

    Usuario.findOne({ "recovery.token":token }).then(usuario => {
      if(!usuario) return res.render("recovery", { errors: "Nenhum usuário encontrado", success: null });
      usuario.finalizarTokenRecuperacaoSenha();
      usuario.setSenha(password);
      return usuario.save().then(() => {
        return res.render("recovery/store", {
          errors: null,
          success: "Senha alterada com sucesso",
          token: null
        })
      }).catch(next);
    }).catch(next);
  }

}

module.exports = UsuarioController;

