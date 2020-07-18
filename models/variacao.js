const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const VariacaoSchema = Schema({
  codigo: { type: String, required: true, unique: true },
  nome: { type: String, required: true },
  preco: { type: Number, required: true },
  promocao: { type: Number },
  fotos: { type: Array, default: [] },
  entrega: {
    type: {
      dimensoes: {  
        type: {
          alturaCm: { type: Number },
          larguraCm: { type: Number },
          profundidadeCm: { type: Number }
        },
        required: true
      },
      pesoKg: { type: Number, required: true },
      freteGratis: { type: Boolean, default: false }
    }
  },
  quantidade: { type: Number, required: true },
  produto: { type: Schema.Types.ObjectId, ref: "Produto" },
  loja: { type: Schema.Types.ObjectId, ref: "Loja" }

}, { timestamps: true });

module.exports = mongoose.model("Variacao", VariacaoSchema);

