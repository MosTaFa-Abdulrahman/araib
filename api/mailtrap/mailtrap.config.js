const { MailtrapClient } = require("mailtrap");

const TOKEN = "3107c09620115013bea6ed03298939d3";

const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

const sender = {
  email: "hello@demomailtrap.com",
  name: "MosTaFa Elbasha",
};

module.exports = { mailtrapClient, sender };
