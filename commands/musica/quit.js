const { getVoiceConnection } = require("@discordjs/voice");

module.exports = {
  name: "quit",
  description: "Desconecta o bot do canal de voz.",
  async execute(message) {
    const connection = getVoiceConnection(message.guild.id);

    if (!connection) return message.reply("Bot não está conectado.");

    connection.destroy();
    message.reply("Bot desconectado.");
  },
};
