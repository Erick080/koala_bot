const prefix = 'k.'; // prefixo dos comandos do bot
const fs = require('node:fs');
const ytdl = require('@distube/ytdl-core');
const yt_sr = require('youtube-sr').default;
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
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

function list_commands(commandlist) {
  let listacomando = '```';
  for (const [nome, comando] of commandlist) {
    listacomando += 'k.' + nome + ' => ' + comando.description + '\n';
  }
  //listacomando += 'k.play [nome/url] => Adiciona música selecionada para a fila.\n';
  //listacomando += 'k.stop => Para a reprodução de áudio do bot, limpando a playlist\n';
  listacomando += '```';
  return listacomando;
}


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
	if (command == "play") {
		client.commands.get(command).execute(message, args.slice(1), struct_musica);
		return;
	} else if (command == "stop") {
		client.commands.get(command).execute(message, struct_musica);
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

client.login(token);
