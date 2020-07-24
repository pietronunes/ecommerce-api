const emailData = require("../config/email");
const transporter = require("nodemailer").createTransport(emailData);
const { api: link } = require("../config/index");

module.exports = ({ usuario, recovery }, cb) => {
  const message = `
    <h1 style="text-align: center;">Recuperacao de Senha</h1>
    <br />
    <p>
        Aqui está o link para redefinir a sua senha. Acesse ele e digite sua nova senha:
    </p>
    <a href="${link}/v1/api/usuarios/senha-recuperada?token=${recovery.token}">
      ${link}/v1/api/usuarios/senha-recuperada?token=${recovery.token}
    </a>
    <br /><br /><hr />
    <p>
        Obs.: Se você não solicitou a redefinicao, apenas ignore esse email.
    </p>
    <br />
    <p>Atenciosamente, Loja TI</p>
  `;

  const opcoesEmail = {
    from: "naorespondalojati@gmail.com",
    to: usuario.email,
    subject: "Redefinição de Senha - LOJA TI",
    html: message,
  };

  if (process.env.NODE_ENV === "production") {
    transporter.sendMail(opcoesEmail, (errors) => {
      if (errors) {
        return cb("Ocorreu um erro ao enviar o email");
      } else {
        return cb(null, "Link para a redefinição de senha foi enviado com sucesso");
      }
    });
  } else {
    console.log(opcoesEmail);
    return cb(null, "Link para a redefinição de senha foi enviado com sucesso");
  }
};
