const Correios = require("node-correios"),
  correios = new Correios(),
  config = require("../../config/correios"),
  { calcBox } = require("../../helpers/calcBox");

/**
 * @description
 * calcularFrete()
 * Função para recuperar valor de Prazo e Frete dos Corrreios.
 * Recebemos como param cep, array de items de um pedido(produto).
 * Fazemos um .map() no produtos para recuperarmos apenas informações de entrega.
 * Usamos uma função calcbox()(helper) para unirmos todas as info de dimensoes.
 * Fazemos uma soma usando o .reduce() (percorre todo o array e vai somando conforme a cond).
 * Utilizando o Promisse.all() enviamos a requisição para os correios de um serviço por vez;
 * Retornamos o resultado em um array de objs.
 */

const calcularFrete = async ({ cep, produtos }) => {
  const _produtos = produtos.map((item) => ({
    pesoKg: item.variacao.entrega.pesoKg,
    profundidadeCm: item.variacao.entrega.dimensoes.profundidadeCm,
    alturaCm: item.variacao.entrega.dimensoes.alturaCm,
    larguraCm: item.variacao.entrega.dimensoes.larguraCm,
    quantidade: item.quantidade,
    preco: item.precoUnitario,
  }));

  const caixa = calcBox(_produtos);
  const pesoTotal = _produtos.reduce((all, item) => all + item.pesoKg * item.quantidade, 0);
  const valorFinal = _produtos.reduce((all, item) => all + item.preco * item.quantidade, 0);

  try {
    const resultados = await Promise.all(
      config.nCdServico.split(",").map(async (servico) => {
        const resultado = await correios.calcPrecoPrazo({
          nCdServico: servico,
          sCepOrigem: config.sCepOrigem,
          sCepDestino: cep,
          nVlPeso: pesoTotal,
          nCdFormato: 1,
          nVlComprimento: caixa.comprimento,
          nVlAltura: caixa.altura,
          nVlLargura: caixa.largura,
          nVlDiamentro: 0,
          nVlValorDeclarado: valorFinal < 20.5 ? 20.5 : valorFinal,
        });
        return { ...resultado[0] };
      })
    );
    return resultados;
  } catch (e) {
    console.log(e);
  }
};

module.exports = { calcularFrete };
