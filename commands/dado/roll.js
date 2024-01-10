module.exports = {
  name: "roll",
  async execute(message, args) {
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

    var def = 0;

    for (let i = 1; i <= nr; i++) {
      const sides = Math.floor(Math.random() * ns + 1);
      lista.push(sides);
      def += sides;
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
      def = lista[0];
    }

    /*lista.forEach(element => {
            def+=element
        }); */

    message.reply(
      def +
        "  " +
        "<---" +
        "  " +
        "[" +
        lista +
        "]" +
        "  " +
        args[args.length - 1]
    );
    //console.log(lista)
  },
};
