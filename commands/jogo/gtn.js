module.exports = {
  name: "gtn",
  description: "Jogo de adivinhação de números",
  async execute(message) {
    let num = Math.floor(Math.random() * 100) + 1;
    let tentativas = 10;

    await message.reply(
      `Vou pensar em um número entre 1 e 100. Tente adivinhar!
      \n\`\`\`Você tem ${tentativas} tentativas restantes.\nDigite um número:\`\`\``
    );

    const filter = (m) =>
      m.author.id === message.author.id && !isNaN(m.content.trim());
    const collector = message.channel.createMessageCollector({
      filter,
      time: 60000,
    });

    collector.on("collect", (m) => {
      let tentativa = parseInt(m.content.trim());

      if (isNaN(tentativa) || tentativa < 1 || tentativa > 100) {
        return message.reply(
          "Por favor, digite um número válido entre 1 e 100."
        );
      }

      if (tentativa === num) {
        message.reply("🎉 Parabéns! Você acertou! 🎉");
        collector.stop();
      } else {
        tentativas--;
        if (tentativas === 0) {
          message.reply(`❌ Suas tentativas acabaram! O número era ${num}.`);
          collector.stop();
        } else {
          let dica = tentativa < num ? "maior" : "menor";
          message.reply(
            `O número que pensei é ${dica} que ${tentativa}. \nVocê tem ${tentativas} tentativas restantes. Digite um número:`
          );
        }
      }
    });

    collector.on("end", (_, reason) => {
      if (reason !== "user" && tentativas > 0) {
        message.reply(`⏳ Tempo esgotado! O número era ${num}.`);
      }
    });
  },
};
