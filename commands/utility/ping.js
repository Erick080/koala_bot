module.exports = {
	name: "ping",
	description: 'pong!',
	async execute(message, args) {
		message.reply("pong!");
	}
}
