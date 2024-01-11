module.exports = {
    name : 'rf',
    async execute(message,args){
        var dado = require('./roll.js')
        const roll = args[1]
        const numero_players = (args.length) - 2
        for(let i = 0; i <= numero_players; i++){
            let p = await dado.roll(roll);
            let r = p.split("  ")[0]
            if(i == 0)
                message.reply(`${message.author} rolou ${r}`)
            else    message.reply(args[args.length-i]+ " rolou " + r)
        }
    }



}