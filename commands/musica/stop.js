module.exports = {
  name: 'stop',
  description: 'Para a reprodução e limpa a fila de musicas.',
  /**
   * Para a reproducao de um audio no bot.
   * @param {Message} message - A mensagem enviada pelo usuario no Discord.
   * @param {struct_musica} struct_musica - Dados como conexão e fila de músicas.
   */
  execute(message, struct_musica) {
    struct_musica.player.pause(true);
    struct_musica.musicas.length = 0;
    message.reply("Playlist limpa e reproducao parada.");
  }
};
