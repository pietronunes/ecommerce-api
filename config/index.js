module.exports = {
  secret: process.env.NODE_ENV === "production" ? process.env.SECRET : "ASFD2AS3F2AS3SADASDASDASDASD45641531",
  api: process.env.NODE_ENV === "production" ? "https://api.loja-teste.com" : "http://localhost:3000",
  loja: process.env.NODE_ENV === "production" ? "https://loja-teste.com" : "http://localhost:8000"   
}