const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");

const ProdutoSchema = Schema({
  titulo: { type: String, required: true },
  descricao: { type: String, required: true },
  disponibilidade: { type: Boolean, default: true },
  fotos: { type: Array, default: [] },
  preco: { type: Number, required: true },
  promocao: { type: Number },
  sku: { type: String, required: true },
  categoria: { type: Schema.Types.ObjectId, ref: "Categoria" },
  avaliacoes: { type: [ { type: Schema.Types.ObjectId, ref: "Avaliacoes" }  ] },
  variacoes: { type: [ { type: Schema.Types.ObjectId, ref: "Variacoes" } ] },
  loja: { type: Schema.Types.ObjectId, ref: "Loja" }
}, { timestamps: true });

ProdutoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Produto", ProdutoSchema);