module.exports = {
	name: 'user',
	description: 'detalhes sobre o usuario',
	async execute(message,args){
		message.reply(`O usuario ${message.author} entrou nesse server em ${message.member.joinedAt}`);
	}

}
