const mongoose = require("mongoose");
const Produto = mongoose.model("Produto");
const Variacao = mongoose.model("Variacao");

const getValuesCarrinho = (carrinho) => {
  let precoTotal = 0;
  let quantidade = 0;
  carrinho.forEach((item) => {
    precoTotal += item.precoUnitario * item.quantidade;
    quantidade += item.quantidade;
  });

  return { precoTotal, quantidade };
};

/**@description
 * -- getValuesLoja () --
 * Percorre um array de objs (carrinho) que é enviado no body do pedidos.store;
 * Retorna no param (item) cada item do carrinho;
 * Armazena nas consts Produto/Variacao todas as info do produto;
 * Se o produto existir e possuir nele o id da variacao executamos:
 * - Adicionamos na precoReal o valor promocional ou o valor normal;
 * - Criamos um obj com preco e qnt para cada item;
 * - Retornamos um obj para cada item;
 * - Somamos os valores de qtd e preco usando o reduce e retornamos no obj;
 */

const getValuesLoja = async (carrinho) => {
  const results = await Promise.all(
    carrinho.map(async (item) => {
      const produto = await Produto.findById(item.produto);
      const variacao = await Variacao.findById(item.variacao);
      let preco = 0;
      let qtd = 0;
      if (produto && variacao && produto.variacoes.map((item) => item.toString()).includes(variacao._id.toString())) {
        let precoReal = variacao.promocao || variacao.preco;
        preco = precoReal * item.quantidade;
        qtd = item.quantidade;
      }
      return { preco, qtd };
    })
  );
  let precoTotal = results.reduce((all, item) => all + item.preco, 0);
  let quantidade = results.reduce((all, item) => all + item.qtd, 0);
  return { precoTotal, quantidade };
};

async function CarrinhoValidation(carrinho) {
  const { quantidade: quantidadeCarrinho, precoTotal: precoTotalCarrinho } = getValuesCarrinho(carrinho); //recebe objs da função
  const { quantidade: quantidadeLoja, precoTotal: precoTotalLoja } = await getValuesLoja(carrinho); //recebe objs da função
  if (quantidadeCarrinho === quantidadeLoja && precoTotalCarrinho === precoTotalLoja) {
    return true;
  } else {
    return false;
  }
}

module.exports = CarrinhoValidation;
