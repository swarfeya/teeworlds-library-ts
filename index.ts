import process from 'process'
import fs from 'fs';

import Client from './lib/client';
import MsgPacker from './lib/MsgPacker';

var argv = process.argv.slice(2)

var a = {host: "", port: 8303}
if (argv.length)
	a = {host: argv[0].split(":")[0], port: parseInt(argv[0].split(":")[1])}
var client: Client;

process.stdin.on("data", data => {
	data = data.slice(0, -2)
	if (data.toString().startsWith(";")) { // ; = command prefix
		var command = data.slice(1).toString().split(" ");
		console.log(command)
		if (command[0] == "vote" && parseInt(command[1]) != NaN) {
			console.log(parseInt(command[1]))
			var packer = new MsgPacker(24, false);
			packer.AddInt(parseInt(command[1]))
				if (client.State == 3)
					client.SendMsgEx(packer, 1)
		} else if (command[0] == "change" && command[1]) {
			try {
				var playerInfo = JSON.parse(fs.readFileSync(__dirname + "\\all.json").toString())
				playerInfo = playerInfo.filter((a: { identity: { name: string; }; }) => a.identity.name.toLowerCase().includes(command[1].replace(/_/g, " ").toLowerCase()))[0]
				console.log(playerInfo)
				
				var packer = new MsgPacker(21, false) // changeinfo
				packer.AddString(playerInfo.identity.name); //m_pName);
				packer.AddString(playerInfo.identity.clan); //m_pClan);
				packer.AddInt(playerInfo.identity.country); //m_Country);
				packer.AddString(playerInfo.identity.skin); //m_pSkin);
				packer.AddInt(playerInfo.identity.use_custom_color ? 1 : 0); //m_UseCustomColor);
				packer.AddInt(playerInfo.identity.color_body); //m_ColorBody);
				packer.AddInt(playerInfo.identity.color_feet); //m_ColorFeet);
					console.log(client.State, "state")
					if (client.State == 3)
						client.SendMsgEx(packer, 1)
			} catch (e) {
				console.log(e)
			}
		} else if (command[0] == "kill") {
			var packer = new MsgPacker(22, false)
				if (client.State == 3)
					client.SendMsgEx(packer, 1)
		} else if (command[0] == "team" && parseInt(command[1]) != NaN) {
		var packer = new MsgPacker(18, false)
			packer.AddInt(parseInt(command[1]))
				if (client.State == 3)
					client.SendMsgEx(packer, 1)
		} else if (command[0] == "emote" && parseInt(command[1]) != NaN) {
			var packer = new MsgPacker(23, false)
			packer.AddInt(parseInt(command[1]))
			client.SendMsgEx(packer, 1)
				if (client.State == 3)
					client.SendMsgEx(packer, 1)
		}
	} else {
	var packer = new MsgPacker(17, false);
		packer.AddInt(0); // team
		packer.AddString(data.toString());
			if (client.State == 3)
				client.SendMsgEx(packer, 1);
	}	
})
process.on("SIGINT", () => { // on ctrl + c
	setTimeout(() => {
		process.exit()
	}, 2500)

	setInterval(() => {
		console.log("BYE! sending disconnect..")
		if (client.State == 3)
			client.SendControlMsg(4).then(() => {
				client.State = 0;
				process.exit()
		})

	}, 500) // send disconnect every 500ms if not disconnected
})

if (!argv[0])
	throw new Error("ip:port not set")
else {
	client = new Client(a.host, a.port, argv[1] ? argv[1] : "nameless tee");
	client.connect();
	client.on("message", (msg: {
		team: number, client_id: number, message: String
	}) => { 
		console.log(msg)
	})
}
