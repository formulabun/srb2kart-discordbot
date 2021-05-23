const path = require('path');
const env = require('dotenv').config({
  path: path.join(__dirname, ".env"),
}).parsed;

const playerresponse = (players, spectator) => {
  const joinnames = (names) => {
    const last = names.pop();
    const init = names.join(", ")
    if( !init )
      return last;
    return `${init} and ${last}`;
  }

  let p_response = "";
  if(players.length === 1)
    p_response = `${players[0]} is lonely.`;
  else if(players.length > 1) {
    p_response = `${joinnames(players)} are racing.`;
  }
  let s_response = "";
  if(spectator.length === 1) {
    s_response = `${joinnames(spectator)} is watching.`;
  } else if(spectator.length >= 1) {
    s_response = `${joinnames(spectator)} are watching.`;
  }
  if(!s_response && !p_response) {
    return "*cricket noises*";
  }
  return `${p_response} ${s_response}`.trim();
}

exports["!players"] = {
  help: "show current players in the server",
  respond: (server) => {
    const playerfiltermap = (players, filter) => {
      return players.filter(filter).map(p => p.name);
    }
    const players = playerfiltermap(server.playerinfo.playerinfo, p=>!p.spectator);
    const spectators = playerfiltermap(server.playerinfo.playerinfo, p=>p.spectator);
    return playerresponse(players, spectators);
  }
}

exports["!join"] = {
  help: "explain how to join this epic server",
  respond: () => 
`Join through the regular multiplayer menu by typing "${env.SERVER}" in the ip field
OR
Create a \`kartexec.cgf\` file in your srb2kart folder and add the next line:
> alias joinserver "connect ${env.SERVER}"
Join the server by opening the command line with the \\\` key and entering \`joinserver\``
}

exports["!help"] = {
  help: "show this help",
  respond: (server) => {
    const commands = Object.keys(exports).map(k => `\`${k}\` ${exports[k].help}`);
    const response = [`${server.serverinfo.servername} is a super cool server for cool people.`,
      "I might not have human rights but I'm still a cool bot. You can ask me to do cool stuff like:"]
    commands.forEach(c => response.push(c))
    
    return response.join("\n");
  }
}