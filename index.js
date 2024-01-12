// Require the necessary discord.js classes
const prefix = 'k.';
const fs = require('node:fs');
const ytdl = require('ytdl-core');
const yt_sr = require('youtube-sr').default;
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const joinVoiceChannel = require('@discordjs/voice').joinVoiceChannel;
const { createAudioResource, createAudioPlayer } = require('@discordjs/voice');
const { token } = require('./config.json');

const struct_musica = {
	connection: null,
	voiceChannel: null,
	textChannel: null,
	player: null,
	musicas: []

}

// Create a new client instance
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
// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", (message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(" ")
	const command = args[0].toLowerCase();
	//executa comandos de musica
	if (command == "play") {
		struct_musica.player = createAudioPlayer();
		if (!struct_musica.connection) join(message, struct_musica);
		if (args.length < 2) return;
		execute(message, args.slice(1), struct_musica);
		return;
	} else if (command == "stop") {
		stop(message, struct_musica.player);
		return;
	}

	if (!client.commands.has(command)) return message.reply("nao tem esse comando ai n cuzao");
	//executa comandos gerais
	try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('ocorreu um erro');
	}
});

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

//executa configuracoes para tocar mscs
async function execute(msg, args, lista_musicas) {
	const voiceChannel = msg.member.voice.channel;
	if (!voiceChannel) {
		return msg.reply("vc precisa estar em um canal de voz");
	}
	var msc_info = {}
	var musica = {}

	if(args[0].startsWith('https')){
		if (!ytdl.validateURL(args)) return;
		msc_info = await ytdl.getInfo(args);
		musica = {
			titulo: msc_info.videoDetails.title,
			url: args,
		};
	} else{
		let url = (await yt_sr.searchOne(args.toString())).url
		musica = {
			titulo : args.toString(),
			url : url,
		};
	}
	
	lista_musicas.voiceChannel = voiceChannel;
	lista_musicas.textChannel = msg.channel;
	lista_musicas.musicas.push(musica);

	msg.channel.send(`${musica.titulo} foi adicionado a fila`);
	if (lista_musicas.musicas.length == 1) {
		play(lista_musicas.musicas[0], lista_musicas.connection, lista_musicas.player);
	}

}

async function play(musica, connection, player) {
	//	const player = createAudioPlayer();
	if (!musica) {
		player.stop();
		return;
	}

	const stream = ytdl(musica.url, { filter: 'audioonly' });
	const resource = createAudioResource(stream, { inlineVolume: true });
	resource.volume.setVolume(0.5);
	resource.playStream
		.on("finish", () => {
			struct_musica.musicas.shift();
			play(struct_musica.musicas[0]);
		})
		.on("error", error => console.log("erro"))

	struct_musica.textChannel.send(`Tocando ${musica.titulo}`);
	connection.subscribe(player);
	player.play(resource);

}


function stop(msg, player) {
	player.stop();
	msg.reply("playlist parada");

}

client.login(token);
