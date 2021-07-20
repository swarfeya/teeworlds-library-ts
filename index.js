const process = require('process')
var MsgPacker = require('./MsgPacker')
var Client = require('./client')
const { kill } = require('process')

var argv = process.argv.slice(2)

var a = {"host": "51.210.171.47", "port": 7303}
if (argv.length)
	a = {"host": argv[0].split(":")[0], "port": argv[0].split(":")[1]}
var clients = [];
// clients.push()
// var client = new Client(a.host, a.port, argv[1] ? argv[1] : "nameless tee");

// client.connect();
process.stdin.on("data", data => {
	data = data.slice(0, -2)
	if (data.toString().startsWith(";")) { // ; = command prefix
		var command = data.slice(1).toString().split(" ");
		console.log(command)
		if (command[0] == "vote" && parseInt(command[1]) != NaN) {
			console.log(parseInt(command[1]))
			var packer = new MsgPacker(24, false);
			packer.AddInt(parseInt(command[1]))
			clients.forEach(client => {
				if (client.State == 3)
					client.SendMsgEx(packer, 1)
			})
		} else if (command[0] == "change" && command[1]) {
			try {
				var playerInfo = JSON.parse(fs.readFileSync(__dirname + "\\all.json").toString())
					// .toString()
					// .replace(/\r/g, "")
					// .split("\n")
				// if (!playerInfo[0])
					// return;
				playerInfo = playerInfo.filter(a => a.identity.name.toLowerCase().includes(command[1].replace(/_/g, " ").toLowerCase()))[0]
				console.log(playerInfo)
				
				var packer = new MsgPacker(21, false) // changeinfo
				packer.AddString(playerInfo.identity.name); //m_pName);
				packer.AddString(playerInfo.identity.clan); //m_pClan);
				packer.AddInt(playerInfo.identity.country); //m_Country);
				packer.AddString(playerInfo.identity.skin); //m_pSkin);
				packer.AddInt(playerInfo.identity.use_custom_color ? 1 : 0); //m_UseCustomColor);
				packer.AddInt(playerInfo.identity.color_body); //m_ColorBody);
				packer.AddInt(playerInfo.identity.color_feet); //m_ColorFeet);
				clients.forEach(client => {
					if (client.State == 3)
						client.SendMsgEx(packer, 1)
				})
			} catch (e) {
			}
		} else if (command[0] == "kill") {
			var packer = new MsgPacker(22, false)
			clients.forEach(client => {
				if (client.State == 3)
					client.SendMsgEx(packer, 1)
			})
		} else if (command[0] == "team" && parseInt(command[1]) != NaN) {
			var packer = new MsgPacker(18, false)
			packer.AddInt(parseInt(command[1]))
			clients.forEach(client => {
				if (client.State == 3)
					client.SendMsgEx(packer, 1)
			})
		} else if (command[0] == "emote" && parseInt(command[1]) != NaN) {
			var packer = new MsgPacker(23, false)
			packer.AddInt(parseInt(command[1]))
			clients.forEach(client => {
				if (client.State == 3)
					client.SendMsgEx(packer, 1)
			})
		}
	} else {
	var packer = new MsgPacker(17, false);
		packer.AddInt(0); // team
		packer.AddString(data.toString() + '\n');
		clients.forEach(client => {
			if (client.State == 3)
				client.SendMsgEx(packer, 1);
		})
	}	
})
process.on("SIGINT", () => { // on ctrl + c
	setTimeout(() => {
		process.exit()
	}, 2500)

	setInterval(() => {
		console.log("BYE! sending disconnect..")
		// console.log(JSON.stringify(clients.filter(client => client.State == 3)))
		if (JSON.stringify(clients.filter(client => client.State == 3)) == "[]")
			process.exit();
		if (proxy)
			fs.writeFileSync(__dirname + "\\socks5.txt", workingProxies.map(a => `${a.host}:${a.port}`).join("\n"));
		clients.forEach(client => {
			if (client.State == 3)
				client.SendControlMsg(4).then(() => {
					client.State = 0;

					// process.exit()
				})
		})

	}, 500) // send disconnect every 500ms if not disconnected
})

var proxy = true;
if (proxy) {
var fs = require('fs')
var workingProxies = []

var proxies = fs.readFileSync(__dirname + "\\socks5.txt")
			.toString()
			.replace(/\r/g, "")
			.split("\n")
			.filter(a => a) // filter empty out
process.setMaxListeners(proxies.length)
var chatEvent = false;
// if (argv.includes("proxies=true")) {
	for (var i = 0; i < proxies.length; i++) {
			clients.push(new Client(a.host, a.port, argv[1] ? argv[1] : "nameless tee", i, {
				host: proxies[i].split(":")[0], // ipv4, ipv6, or hostname
				port: parseInt(proxies[i].split(":")[1]),
				type: 5
			}))
			clients[i].connect();
			clients[i].on("connected", (clientId) => {
				if (!chatEvent) {
					chatEvent = true
					clients[clientId].on("message", (msg) => {
						console.log(msg)
					})
				}
				if (!workingProxies.map(a => `${a.host}:${a.port}`).includes(`${clients[clientId].proxy.host}:${clients[clientId].proxy.port}`))
					workingProxies.push(clients[clientId].proxy);
				// console.log(client)
				console.log("connected with ", proxies[clientId])
				// var packer = new MsgPacker(17, false);
				// packer.AddInt(0); // team
				// packer.AddString('yoyoyo\n');
				if (argv.includes("f4")) {
					var packer = new MsgPacker(24, false);
					packer.AddInt(-1)
					clients[clientId].SendMsgEx(packer, 1);
				} else if (argv.includes("f3")) {
					var packer = new MsgPacker(24, false);
					packer.AddInt(1)
					clients[clientId].SendMsgEx(packer, 1);
				}
				else {
					// var packer = new MsgPacker(17, false);
					// packer.AddInt(0); // team
					// packer.AddString('yoyoyo\n');
				}
		})
	}
// }
} else {
	clients.push(new Client(a.host, a.port, argv[1] ? argv[1] : "nameless tee", 0));
	clients[0].connect();
	clients[0].on("connected", (clientId) => {
		// console.log(client)
		console.log("connected!")
		// var packer = new MsgPacker(17, false);
		// packer.AddInt(0); // team
		// packer.AddString('yoyoyo\n');
		if (argv.includes("f4")) {
			var packer = new MsgPacker(24, false);
			packer.AddInt(-1)
			clients[clientId].SendMsgEx(packer, 1);
		} else if (argv.includes("f3")) {
			var packer = new MsgPacker(24, false);
			packer.AddInt(1)
			clients[clientId].SendMsgEx(packer, 1);
		}
		else {
			// var packer = new MsgPacker(17, false);
			// packer.AddInt(0); // team
			// packer.AddString('yoyoyo\n');
		}
})
	clients[0].on("message", (msg) => {
		console.log(msg)
	})
}