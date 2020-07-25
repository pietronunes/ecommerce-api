module.exports = {
  mode: process.env.NODE_ENV === "production" ? "live" : "sandbox",
  sandbox: process.env.NODE_ENV === "production" ? false : true,
  sandbox_email: process.env.NODE_ENV === "production" ? null : "c89061293170088783641@sandbox.pagseguro.com.br",
  email: "pietrociprianonunes123@gmail.com",
  token: "1D152571115A409AAEAC9740F944C602",
  notificationURL: "https://api.loja-teste.com/v1/api/pagamentos/notificacao",
};
