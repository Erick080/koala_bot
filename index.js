const prefix = 'k.'; // prefixo dos comandos do bot
const fs = require('node:fs');
const ytdl = require('@distube/ytdl-core');
const yt_sr = require('youtube-sr').default;
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const joinVoiceChannel = require('@discordjs/voice').joinVoiceChannel;
const { createAudioResource, createAudioPlayer } = require('@discordjs/voice');
require('dotenv').config()
const token = process.env.TOKEN;

const struct_musica = {
	connection: null,
	voiceChannel: null,
	textChannel: null,
	player: null,
	musicas: []
}

const client = new Client({
	intents: [
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildBans,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildVoiceStates]
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

// procura por subdiretorios do diretorio commands para achar listas de comandos, ao achar adiciona na lista client.commands
for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		if ('name' in command && 'execute' in command) {
			client.commands.set(command.name, command);
		} else {
			console.log(`O comando em ${filePath} esta sem propriedades data ou execute`);
		}
	}
}

// login, acontece apenas uma vez, quando o bot eh iniciado
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// fica lendo mensagens do chat, verificando se alguma eh um comando reconhecido
client.on("messageCreate", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(" ")
	const command = args[0].toLowerCase();

	//executa comandos de musica
	//TODO: Criar pasta de musica para incluir ela nos comandos gerais
	if (command == "play") {
		struct_musica.player = createAudioPlayer();
		if (!struct_musica.connection) join(message, struct_musica);
		if (args.length < 2) return;  //TODO: Overload sem parametros para quando tiverem musicas na queue mas o bot esta pausado
		search_music(message, args.slice(1), struct_musica);
		return;
	} else if (command == "stop") {
		stop(message, struct_musica);
		return;
	} 
	//mostra lista de comandos; 
	else if(command == 'commands'){
		message.reply(list_commands(client.commands))
		return
	}

	if (!client.commands.has(command)){ 
		return message.reply("esse comando nao existe");
	}

	//executa comandos gerais
	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('ocorreu um erro');
	}
});

/**
  * @param {string}	   msg			referencia a mensagem requisitando o bot para entrar na chamada
  * @param {struct_musica} lista_musicas	referencia para a struct_musica 
  */
async function join(msg, lista_musicas) {
	const voiceChannel = msg.member.voice.channel;
	if (!voiceChannel) msg.reply("vc precisa estar em um canal de voz");
	const connection = await joinVoiceChannel({
		channelId: msg.member.voice.channel.id,
		guildId: msg.guild.id,
		adapterCreator: msg.guild.voiceAdapterCreator,
	});
	lista_musicas.connection = connection;
}

/**
  * @param {string}	   msg			referencia para a mensagem que o bot processou
  * @param {string}	   args			link ou nome da musica informado no comando	
  * @param {struct_musica} lista_musicas	referencia para a struct_musica
  */
async function search_music(msg, args, lista_musicas) {
	const voiceChannel = msg.member.voice.channel;
	if (!voiceChannel) {
		return msg.reply("vc precisa estar em um canal de voz");
	}
	var msc_info = {}
	var musica = {}

	//procura o video usando api de busca do yt
	if(args[0].startsWith('https')){ //se for inserido o link
		msc_info = await ytdl.getInfo(args[0]);
		musica = {
			titulo: msc_info.videoDetails.title,
			url: args[0],
		};
	} else { //se for inserido apenas o nome
		let url = (await yt_sr.searchOne(args.toString())).url
		musica = {
			titulo : await ytdl.getInfo(url).then((info) => {return info.videoDetails.title}),
			url : url,
		};
	}
	lista_musicas.voiceChannel = voiceChannel;
	lista_musicas.textChannel = msg.channel;
	lista_musicas.musicas.push(musica);

	msg.channel.send(`${musica.titulo} foi adicionado a fila`);
	console.log(lista_musicas.musicas.length)
	if (lista_musicas.musicas.length == 1) {
		play(lista_musicas.musicas[0], lista_musicas.connection, lista_musicas.player);
	}

}

/**
  * @param {titulo, url}      musica	  tupla com informacoes sobre a musica.
  * @param {VoiceConnection}  connection  representa a conexao do bot com o canal de voz
  * @param {AudioPlayer}      player      utilizado para reproduzir audio	
  */
async function play(musica, connection, player) {
	if (!musica) {
		player.stop(true);
		return;
	}

	const stream = ytdl(musica.url, { filter: 'audioonly' });
	const resource = createAudioResource(stream, { inlineVolume: true });
	resource.volume.setVolume(0.5);
	resource.playStream
		.on("finish", () => {
			struct_musica.musicas.shift();
			if (struct_musica.length > 0){
				play(struct_musica.musicas[0]);
			}
			else
				play(struct_musica.musicas[0]);
		})
		.on("error", error => console.log(error))

	struct_musica.textChannel.send(`Tocando ${musica.titulo}`);
	connection.subscribe(player);
	player.play(resource);

}

/**
  * @param {string}	   msg			referencia a mensagem requisitando o bot para entrar na chamada
  * @param {struct_musica} lista_musicas	referencia para a struct_musica 
  */
function stop(msg, lista_musicas) {
	lista_musicas.player.pause(true);
	lista_musicas.musicas.length = 0;
	msg.reply("playlist limpa");

}

function list_commands(commandlist){
		var listacomando = '```';
		for(const [nome,comando] of commandlist){
			listacomando += 'k.'+nome+' => ' + comando.description +'\n'
		}
		listacomando += 'k.play [nome/url] => Adiciona musica selecionada para a fila.\n'
		listacomando += 'k.stop => Para a reprodução de audio do bot, limpando a playlist\n'
		listacomando += '```'
		return listacomando

}

client.login(token);
