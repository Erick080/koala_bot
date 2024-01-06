"// Require the necessary discord.js classes"
const prefix = 'k.';
const fs = require('node:fs');
const ytdl = require('ytdl-core');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

const struct_musica = {
	connection : null,
	voiceChannel : null,
	textChannel : null,
	musicas : []
}

// Create a new client instance
const client = new Client({ intents: [ 
  GatewayIntentBits.DirectMessages,
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildBans,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent,
 GatewayIntentBits.GuildVoiceStates] });

client.commands = new Collection();

const foldersPath = path.join(__dirname,'commands');
const commandFolders = fs.readdirSync(foldersPath);

for(const folder of commandFolders){
	const commandsPath = path.join(foldersPath,folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for(const file of commandFiles){
		const filePath = path.join(commandsPath,file);
		const command = require(filePath);

		if('name' in command && 'execute' in command){
			client.commands.set(command.name,command);
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
	if(!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(" ")
	const command = args[0].toLowerCase();
	//executa comandos de musica
	if (command == "play") {
		if (args.length < 2) return;	
		execute(message,args[1],struct_musica); 
		return;
	  } else if (command == "skip") {
		message.reply("NAO IMPLEMENTADO")
		return;
	  } else if (command == "stop") {
		message.reply("NAO IMPLEMENTADO");
		return;
	}

	if(!client.commands.has(command)) return message.reply("nao tem esse comando ai n cuzao");
	//executa comandos gerais
	try{
		client.commands.get(command).execute(message,args);
	} catch (error){
		console.error(error);
		message.reply('ocorreu um erro');
	}
});

//executa configuracoes para tocar mscs
async function execute(msg,url,lista_musicas){
	const voiceChannel = msg.member.voice.channel;
	if(!voiceChannel) {
		return msg.reply("vc precisa estar em um canal de voz");
	}
	if(!ytdl.validateURL(url)) return;
	const msc_info = await ytdl.getInfo(url);
	const musica = {
		titulo: msc_info.videoDetails.title,
		url: url,
	};

	msg.reply(`O titulo do video e ${musica.titulo}`);
}

function play(musica){
}

function skip(msg,lista_musicas){}

function stop(msg,lista_musicas){}


client.login(token);
