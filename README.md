# tw-chatonly
Library to connect a bot to a Teeworlds server.

https://www.npmjs.com/package/teeworlds


# Usage
Example file:
```const teeworlds = require('teeworlds');
let client = new teeworlds.Client("127.0.0.1", 8303, "teest");

client.connect();

client.on("connected", () => {
	console.log("Connected!");
})

client.on("disconnect", reason => {
	// if you got kicked from the server
	console.log("Disconnected: " + reason);
})

client.on("message", message => {
	/* {
  team: 0,
  client_id: 14,
  message: 'a',
  author: {
    ClientInfo: {
      name: 'Nudelsaft c:',
      clan: '',
      country: 276,
      skin: 'coala_toptri',
      use_custom_color: 0,
      color_body: 4718592,
      color_feet: 5046016
    },
    PlayerInfo: { local: 0, client_id: 4, team: 0, score: 36, latency: 0 }
  }
}
	 */
	console.log(message);
})

client.on("kill", info => {
	/* {
  killer_id: 14,
  victim_id: 14,
  weapon: -3,
  special_mode: 0,
  victim: {
    ClientInfo: {
      name: 'Nudelsaft c:',
      clan: '',
      country: 276,
      skin: 'coala_toptri',
      use_custom_color: 0,
      color_body: 4718592,
      color_feet: 5046016
    },
    PlayerInfo: { local: 0, client_id: 4, team: 0, score: 36, latency: 0 }
  },
  killer: {
    ClientInfo: {
      name: 'Nudelsaft c:',
      clan: '',
      country: 276,
      skin: 'coala_toptri',
      use_custom_color: 0,
      color_body: 4718592,
      color_feet: 5046016
    },
    PlayerInfo: { local: 0, client_id: 4, team: 0, score: 36, latency: 0 }
  }
}
	*/
	console.log(info)
})

process.on("SIGINT", () => {
	client.Disconnect(); // disconnect on ctrl + c
})
process.stdin.on("data", data => {
	client.Say(data.toString()); // write input in chat
	
})

function change() {
	client.ChangePlayerInfo({
		name: "new name",
		clan: "new clan",
		country: 12,
		skin: "default",
		use_custom_color: true,
		color_body: 12,
		color_feet: 1111
	})
}```
