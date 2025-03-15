const { createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
const yt_sr = require('youtube-sr').default;
const joinVoiceChannel = require('@discordjs/voice').joinVoiceChannel;
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'play',
  description: 'Adiciona uma música na fila.',
/* *
   * Executa o comando 'play'.
   * @param {Message} message - A mensagem enviada pelo usuário no Discord.
   * @param {string[]} args - URL ou nome da música.
   * @param {struct_musica} - Dados de conexão e fila de músicas.
   */
  async execute(message, args, struct_musica) {
    struct_musica.player = createAudioPlayer();
    if (!struct_musica.connection) await join(message, struct_musica);
    if (args.length < 1) return message.reply('Você precisa fornecer o nome ou URL da música.');
    await search_music(message, args, struct_musica);
  }
};

/* *
   * Utiliza api yt-sr para buscar o video solicitado.
   * @param {Message} message - A mensagem enviada pelo usuário no Discord.
   * @param {string[]} args - URL ou nome da música.
   * @param {struct_musica} lista_musicas - Dados de conexão e fila de músicas.
   */
async function search_music(msg, args, lista_musicas) {
  const voiceChannel = msg.member.voice.channel;
  if (!voiceChannel) {
    return msg.reply("Você precisa estar em um canal de voz");
  }
  var msc_info = {};
  var musica = {};

  if (args[0].startsWith('https')) {
    msc_info = await ytdl.getInfo(args[0]);
    musica = {
      titulo: msc_info.videoDetails.title,
      autor: msc_info.author.name,
      url: args[0],
    };
  } else {
    let url = (await yt_sr.searchOne(args.toString())).url; //TODO: Add param opcional para mostrar mais de 1 opcao
    msc_info = await ytdl.getInfo(url).then((info) => {return info.videoDetails})
    console.log(msc_info)

    musica = {
      titulo: msc_info.title,
      autor: msc_info.author.name,
      url: url,
    };
  }
  lista_musicas.voiceChannel = voiceChannel;
  lista_musicas.textChannel = msg.channel;
  lista_musicas.musicas.push(musica);

  msg.channel.send(`${musica.titulo} foi adicionado à fila`);

  musica_embed = new EmbedBuilder()
                    .setTitle(musica.titulo)
                    .setURL(musica.url)
                    .setAuthor({name: musica.autor})
                    .setDescription(`Adicionado na posicao #${lista_musicas.musicas.length} da fila.`)

  msg.channel.send({ embeds: [musica_embed]})

  if (lista_musicas.musicas.length === 1) {
    play(lista_musicas.musicas[0], lista_musicas.connection, lista_musicas.player, lista_musicas);
  }
}

/**
  * Função que inicia a reprodução da musica.
  * @param {Object} musica - Contem titulo e url.
  * @param {VoiceConnection} connection - Conexao do bot com o canal de voz.
  * @param {AudioPlayer} player - O player de audio usado para reproduzir a musica.
  */
async function play(musica, connection, player, struct_musica) {
  if (!musica) {
    player.stop(true);
    return;
  }

  const stream = ytdl(musica.url, { filter: 'audioonly' });
  const resource = createAudioResource(stream, { inlineVolume: true });
  resource.volume.setVolume(0.5); //TODO: comando para alterar isso
  resource.playStream
    .on("finish", () => {
      struct_musica.musicas.shift();
      if (struct_musica.length > 0) {
        play(struct_musica.musicas[0]);
      }
    })
    .on("error", error => console.log(error));

  connection.subscribe(player);
  player.play(resource);
}

/**
 * Funcao que conecta o bot a um canal de voz.
 * @param {Message} msg - A mensagem enviada pelo usuario no Discord.
 * @param {struct_musica} lista_musicas - A estrutura que contem as informações da música e da fila.
 */
async function join(msg, lista_musicas) {
  const voiceChannel = msg.member.voice.channel;
  if (!voiceChannel) return msg.reply("Você precisa estar em um canal de voz");

  const connection = await joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: msg.guild.id,
    adapterCreator: msg.guild.voiceAdapterCreator,
  });

  lista_musicas.connection = connection;
}
