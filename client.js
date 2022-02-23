import path from 'path';
import {Client, Intents} from 'discord.js';
import {config} from 'dotenv';
const env = config().parsed;
import commands from './commands.js';
import {getSrb2Info} from 'srb2kartjs';

let server = {}

export default class FormulaBunBot extends Client{

  constructor(param) {
    super(param);
    this.players = {};
    this.on('ready', () => {

      this.registercommands();
      this.ws.on('INTERACTION_CREATE', interaction => this.respond(interaction));

      this.updateData();
    });
  }
  
  registercommands() {
    for (let c in commands) {
      if (commands.hasOwnProperty(c)) {
        this.api.applications(this.user.id)
          .guilds(env.TEST_GUILD) // might need to use `npm test` `npm deploy` for this
          .commands.post(
          {data: {
            name: c,
            description: commands[c].descr,
          }})
        .then(() => {console.log(`registered ${c}`)})
        .catch(console.error);
      }
    }
  }

  updateData() {
    const client = this;
    getSrb2Info(env.SERVER, env.PORT, (serverinfo)=>{
      server.serverinfo = serverinfo;
      const stat = `${serverinfo.numberofplayers} players race`
      client.user.setActivity(stat, {type: 'WATCHING'})
      .then(() => {
        if(serverinfo.numberofplayers === 0)
          client.user.setStatus("idle")
        else
          client.user.setStatus("online")
      })
      .catch(console.error);
    }, (plinfo) => {
      server.playerinfo = plinfo
    }, (err) => {
      client.user.setActivity("for a heartbeat", {type: 'LISTENING'})
      .then(() => {
        client.user.setStatus("dnd")
      });
    });
  }

  respond(interaction) {
    const command = interaction.data.name
    
    if(!server.serverinfo || !server.playerinfo) {
      console.log("no info");
      return;
    }

    if(commands[command]) {
      const response = commands[command].respond(server);

      this.api.interactions(interaction.id, interaction.token).callback.post({
        data: {
          type: 4,
          data: {
            content: response.content,
            embeds: response.embed,
          }
        }
      })
    }
  }
}
