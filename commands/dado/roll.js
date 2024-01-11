module.exports = {
  name: "roll",
  async execute(message, args) {
    var res = await this.roll(args)
    message.reply(res);
  },
  async roll(args) {
    const roll = args[args.length - 1].split("d");
    //definir a quantia e lados de dados
    //nr = Number of rolls
    var nr = roll[0];
    //ns = number of sides
    var ns = roll[1];

    //roll side
    var lista = [];
    if (nr == 0) {
      nr = 1;
    }

    var resultado = 0;

    for (let i = 1; i <= nr; i++) {
      const sides = Math.floor(Math.random() * ns + 1);
      lista.push(sides);
      resultado += sides;
    }

    if (args.length > 2) {
      switch (args[1]) {
        case "-":
          lista = lista.sort((a, b) => a - b);
          break;
        case "+":
          lista = lista.sort((a, b) => b - a);
          break;
      }
      resultado = lista[0];
    }

    return (
      resultado +
      "  " +
      "<---" +
      "  " +
      "[" +
      lista +
      "]" +
      "  " +
      args[args.length - 1]
    );
  },
};
