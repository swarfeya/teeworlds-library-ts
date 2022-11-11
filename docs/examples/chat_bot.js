let teeworlds = require('teeworlds');
let client = new teeworlds.Client("127.0.0.1", 8303, "nameless bot");

client.on("connected", () => console.log("connected!"))

client.on("message", (msg) => {
	console.log(msg.author?.ClientInfo?.name, msg.message)
	if (msg.message.toLowerCase() == ";help") {
		client.game.Say(`${msg.author?.ClientInfo?.name}: Commands: ;help, ;myskin, ;say, ;list`);
	} else if (msg.message.toLowerCase() == ";myskin") {
		client.game.Say(`${msg.author?.ClientInfo?.name}: Your skin: ${msg.author?.ClientInfo?.skin}`);
	} else if (msg.message.toLowerCase().startsWith(";say ")) {
		client.game.Say(msg.message.slice(";say ".length))
	} else if (msg.message.toLowerCase() == ";list") {
		let list = client.SnapshotUnpacker.AllObjClientInfo.map( a => a.name );
		client.game.Say(list.join(", "));
	}
})

client.connect();

process.on("SIGINT", () => {
	client.Disconnect().then(() => process.exit(0)); // disconnect on ctrl + c
	// process.exit()
})