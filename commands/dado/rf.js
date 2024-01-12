module.exports = {
    name : 'rf',
    async execute(message,args){
        var dado = require('./roll.js')
        //const roll = args[1]
        var numero_players = 0
        let input_dado = 'undefined' 
        if(args.find((element) => element == '+' || element == '-')){ 
            input_dado = args.slice(1,3)
            numero_players = args.length - 3
        }
        else {
            input_dado = [args[1]]
            numero_players = args.length - 2
        }
        
        for(let i = 0; i <= numero_players; i++){
            let p = await dado.roll(input_dado);
            if(i == 0)
                message.reply(`${message.author.displayName} rolou ${p}`)
            else    message.reply(args[args.length-i]+ " rolou " + p)
        }
    }



}
