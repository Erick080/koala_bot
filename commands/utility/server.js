module.exports = {
	name: 'server',
	description: 'informacoes sobre o servidor',
        async  execute(message,args){
		message.reply(`Este servidor foi criado em ${message.guild.createdAt}`);
	}
};
