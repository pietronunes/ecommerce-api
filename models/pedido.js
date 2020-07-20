const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosePaginate = require("mongoose-paginate");

const PedidoSchema = Schema({
  cliente: { type: Schema.Types.ObjectId, ref: "Cliente", required: true },
  carrinho: {
    type: [{
      produto: { type: Schema.Types.ObjectId, ref: "Produto", required: true },
      variacao: { type: Schema.Types.ObjectId, ref: "Variacao", required: true },
      produtoEstatico: { type: String },
      precoUnitario: { type: Number, required: true },
      quantidade: { type: Number, default: 1 },
    }]
  },
  cancelado: { type: Boolean, default: false },
  entrega: { type: Schema.Types.ObjectId, ref: "Entrega", required: true },
  pagamento: { type: Schema.Types.ObjectId, ref: "Pagamento", required: true },
  loja: { type: Schema.Types.ObjectId, ref: "Loja", required: true }
}, { timestamps: true });

PedidoSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Pedido", PedidoSchema);
