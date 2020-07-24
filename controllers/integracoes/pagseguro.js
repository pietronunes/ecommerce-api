const pagseguroConfig = require("../../config/pagseguro");
const PagSeguro = require("../../helpers/pagseguro");

const _criarPagamentoComBoleto = (senderHash, { cliente, carrinho, entrega, pagamento }) => {
  return new Promise((resolve, reject) => {
    const pag = new PagSeguro(pagseguroConfig); // estanciando classe node-pagseguro

    // Definir dados do comprador
    pag.setSender({
      name: cliente.nome,
      email: cliente.usuario.email,
      cpf_cnpj: cliente.cpf.replace(/[-.]/g, ""),
      area_code: cliente.telefones[0].slice(0, 2), // pegando apenas o ddd
      phone: cliente.telefones[0].slice(2).trim(), // pegando o telefone inteiro
      birth_date: cliente.dataDeNascimento, // DD-MM-YYYY
    });

    // Definir endereco entrega pelo pagseguro
    pag.setShipping({
      street: entrega.endereco.local,
      number: entrega.endereco.numero,
      district: entrega.endereco.bairro,
      city: entrega.endereco.cidade,
      state: entrega.endereco.estado,
      postal_code: entrega.endereco.CEP.replace(/-/g, ""),
      same_for_billing: pagamento.enderecoEntregaIgualCobranca, // true ou false
    });

    // Definir endereco combrança pelo pagseguro
    pag.setBilling({
      street: pagamento.endereco.local,
      number: pagamento.endereco.numero,
      district: pagamento.endereco.bairro,
      city: pagamento.endereco.cidade,
      state: pagamento.endereco.estado,
      postal_code: pagamento.endereco.CEP.replace(/-/g, ""),
    });

    // Percorrendo uma array e add dentro do "carrinho" do pagseguro
    carrinho.forEach((item) => {
      pag.addItem({
        qtde: item.quantidade,
        value: item.precoUnitario,
        description: `${item.produto.titulo} - ${item.variacao.nome}`, // descrição produto
      });
    });

    // Add o frete como item do pagamento
    pag.addItem({
      qtde: 1,
      value: entrega.custo,
      description: `Custo de Entrega - Correios`,
    });

    // Enviando transação
    pag.sendTransaction(
      {
        method: "boleto", //boleto
        value: pagamento.valor,
        installments: 1, //parcelas
        hash: senderHash, // hash de pagamento
      },
      (err, data) => (err ? reject(err) : resolve(data)) // cb
    );
  });
};

const _criarPagamentoComCartao = (senderHash, { cliente, carrinho, entrega, pagamento }) => {
  return new Promise((resolve, reject) => {
    const pag = new PagSeguro(pagseguroConfig);

    // Definir dados do comprador
    pag.setSender({
      name: cliente.nome,
      email: cliente.usuario.email,
      cpf_cnpj: cliente.cpf.replace(/[-.]/g, ""),
      area_code: cliente.telefones[0].slice(0, 2),
      phone: cliente.telefones[0].slice(2).trim(),
      birth_date: cliente.dataDeNascimento, // DD-MM-YYYY
    });

    // Definir endereco entrega pelo pagseguro
    pag.setShipping({
      street: entrega.endereco.local,
      number: entrega.endereco.numero,
      district: entrega.endereco.bairro,
      city: entrega.endereco.cidade,
      state: entrega.endereco.estado,
      postal_code: entrega.endereco.CEP.replace(/-/g, ""),
      same_for_billing: pagamento.enderecoEntregaIgualCobranca, // true ou false
    });

    // Definir endereco combrança pelo pagseguro
    pag.setBilling({
      street: pagamento.endereco.local,
      number: pagamento.endereco.numero,
      district: pagamento.endereco.bairro,
      city: pagamento.endereco.cidade,
      state: pagamento.endereco.estado,
      postal_code: pagamento.endereco.CEP.replace(/-/g, ""),
    });

    // Percorrendo uma array e add dentro do "carrinho" do pagseguro
    carrinho.forEach((item) => {
      pag.addItem({
        qtde: item.quantidade,
        value: item.precoUnitario,
        description: `${item.produto.titulo} - ${item.variacao.nome}`,
      });
    });

    // Add o frete como item do pagamento
    pag.addItem({
      qtde: 1,
      value: entrega.custo,
      description: `Custo de Entrega - Correios`,
    });

    //Dados do Dono do Cartão
    pag.setCreditCardHolder({
      name: pagamento.cartao.nomeCompleto || cliente.nome, // nome
      area_code: pagamento.cartao.codigoArea.trim() || cliente.telefones[0].slice(0, 2), // codigo telefone
      phone: pagamento.cartao.codigoArea.trim() || cliente.telefones[0].slice(2), // phone
      birth_date: pagamento.cartao.dataDeNascimento || cliente.dataDeNascimento, // data nascimento
      cpf_cnpj: (pagamento.cartao.cpf || cliente.cpf).replace(/[-.]/g, ""), // cpf
    });

    // Enviando transação
    pag.sendTransaction(
      {
        method: "creditCard", // cartao
        value: pagamento.valor % 2 !== 0 && pagamento.parcelas !== 1 ? pagamento.valor + 0.01 : pagamento.valor,
        installments: pagamento.parcelas,
        hash: senderHash,
        credit_card_token: pagamento.cartao.credit_card_token, // token do cartão de crédito
      },
      (err, data) => (err ? reject(err) : resolve(data)) // cb
    );
  });
};

const criarPagamento = async (senderHash, data) => {
  //senderHash = token Criado no Front, data = dadosPag
  try {
    if (data.pagamento.forma === "boleto") return await _criarPagamentoComBoleto(senderHash, data);
    else if (data.pagamento.forma === "creditCard") return await _criarPagamentoComCartao(senderHash, data);
    else return { errorMessage: "Forma de Pagamento não encontrada!" };
  } catch (err) {
    console.log(err);
    return { errorMessage: "Ocorreu um erro!", errors: err };
  }
};

// Pegar Id da sessao
const getSessionId = () => {
  return new Promise((resolve, reject) => {
    const pag = new PagSeguro(pagseguroConfig);
    pag.sessionId((err, session_id) => (err ? reject(err) : resolve(session_id)));
  });
};

// Pegar status da transação
const getTransactionStatus = (codigo) => {
  return new Promise((resolve, reject) => {
    const pag = new PagSeguro(pagseguroConfig);
    pag.transactionStatus(codigo, (err, result) => (err ? reject(err) : resolve(result)));
  });
};

// Pegar notificações do pagseguro
const getNotification = (codigo) => {
  return new Promise((resolve, reject) => {
    const pag = new PagSeguro(pagseguroConfig);
    pag.getNotification(codigo, (err, result) => (err ? reject(err) : resolve(result)));
  });
};

module.exports = {
  criarPagamento,
  getSessionId,
  getTransactionStatus,
  getNotification,
};
