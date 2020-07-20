const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");

const EntregaSchema = Schema({
  status: { type: String, required: true },
  codigoRastreamento: { type: String },
  tipo: { type: String, required: true },
  custo: { type: Number, required: true },
  prazo: { type: Number, required: true },
  pedido: { type: Schema.Types.ObjectId, ref: "Pedido" },
  loja: { type: Schema.Types.ObjectId, ref: "Loja" },
  payload: { type: Object }
}, { timestamps: true });

EntregaSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Entrega", EntregaSchema);


