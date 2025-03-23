module.exports = {
  name: "gtn",
  description: "Jogo de adivinhação de números",
  async execute(message) {
    let num = Math.floor(Math.random() * 100) + 1;
    var tentativas = 10;

    await message.reply(
      `Vou pensar em um número entre 1 e 100. Tente adivinhar!
      \n\`\`\`Você tem ${tentativas} tentativas restantes.\nDigite um número:\`\`\``
    );

    const filter = (m) =>
      m.author.id === message.author.id && !isNaN(m.content.trim());
    const collector = message.channel.createMessageCollector({
      filter,
      time: 60000,
      max: tentativas,
    });

    collector.on("collect", (m) => {
      let tentativa = parseInt(m.content.trim());
      let tentativasRestantes = tentativas - collector.collected.size;
      if (tentativa < 1 || tentativa > 100) {
        return m.reply("Por favor, digite um número válido entre 1 e 100.");
      }

      if (tentativa === num) {
        message.reply("🎉 Parabéns! Você acertou! 🎉");
        collector.stop();
      } else {
        if (tentativasRestantes > 0) {
          let dica = tentativa < num ? "maior" : "menor";
          m.reply(
            `O número que pensei é ${dica} que ${tentativa}. \nVocê tem ${tentativasRestantes} tentativas restantes. Digite um número:`
          );
        }
      }
    });

    collector.on("end", (_, reason) => {
      if (reason !== "user" && tentativasRestantes > 0) {
        message.reply(`⏳ Tempo esgotado! O número era ${num}.`);
      } else if (tentativasRestantes === 0) {
        message.reply(`❌ Suas tentativas acabaram! O número era ${num}.`);
        collector.stop();
      }
    });
  },
};
