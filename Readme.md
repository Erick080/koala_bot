Bot para servidores de discord com funcionalidades de reproduzir audios do YouTube e sistema de rolagem de dados.

## Dependências
 - nodejs >= 21.5.0
 - python3
 - ffmpeg (apenas se for usar a integração com YouTube)
  
As demais dependencias são instaladas com npm install.

## Ativando o bot
```sh
node index.js
```
OBS: É preciso criar um arquivo .env e inserir o token de seu bot em uma variavel TOKEN, caso contrário o bot não conseguirá logar no discord.

Para ver a lista de comandos disponíveis usar k.commands.
