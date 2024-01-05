module.exports = {
	name: 'ping',
	description: 'Ping!',
		async execute(message,args){
		message.reply('Pong');
	},
};
