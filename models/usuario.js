const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const secret = require("../config/index").secret;

const UsuarioSchema = Schema(
  {
    nome: {
      type: String,
      required: [true, "campos vazios não são permitidos"],
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "campos vazios não são permitidos"],
      index: true,
      match: [/\S+@\S+\.\S+/, "é inválido"],
    },
    loja: {
      type: Schema.Types.ObjectId,
      ref: "Loja",
      required: true,
    },
    permissao: {
      type: Array,
      default: ["cliente"],
    },
    hash: { type: String },
    salt: { type: String },
    recovery: {
      type: {
        token: String,
        data: Date,
      },
      default: {},
    },
  },
  { timestamps: true }
);

UsuarioSchema.plugin(uniqueValidator, { message: "já está sendo utilizado" });

UsuarioSchema.methods.setSenha = function (password) {
  this.salt = crypto.randomBytes(16).toString("hex");
  this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
};

UsuarioSchema.methods.validarSenha = function (password) {
  const hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, "sha512").toString("hex");
  return hash === this.hash;
};

UsuarioSchema.methods.gerarToken = function () {
  const hoje = new Date();
  const exp = new Date(hoje);
  exp.setDate(hoje.getDate() + 15);

  return jwt.sign(
    {
      id: this._id,
      email: this.email,
      nome: this.nome,
      exp: parseFloat(exp.getTime() / 1000, 10),
    },
    secret
  );
};

UsuarioSchema.methods.enviarAuthJSON = function () {
  return {
    _id: this._id,
    nome: this.nome,
    email: this.email,
    loja: this.loja,
    role: this.permissao,
    token: this.gerarToken(),
  };
};

//RECUPERAÇÃO DE SENHA
UsuarioSchema.methods.criarTokenRecuperacaoSenha = function () {
  this.recovery = {};
  this.recovery.token = crypto.randomBytes(16).toString("hex");
  this.recovery.date = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
  return this.recovery;
};

UsuarioSchema.methods.finalizarTokenRecuperacaoSenha = function () {
  this.recovery = { token: null, date: null };
};

module.exports = mongoose.model("Usuario", UsuarioSchema);
