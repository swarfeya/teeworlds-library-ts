/*
This is the main Node.js server script for your project
- The two endpoints this back-end provides are defined in fastify.get and fastify.post below
*/

const path = require("path");
const net = require('dgram')
let bufffff = Buffer.from([255, 255, 255, 255])
function arrStartsWith(arr, arrStart, start=0) {
    arr.splice(0, start)
    for (let i = 0; i < arrStart.length; i++) {
        if (arr[i] == arrStart[i])
            continue;
        else return false;
    }
    return true;
}
class MinecraftProtocol {
	static writeVarInt(val) {
		// "VarInts are never longer than 5 bytes"
		// https://wiki.vg/Data_types#VarInt_and_VarLong
		const buf = Buffer.alloc(5)
		// let written = 0

		// while (true) {
		// 	if ((val & 0xFFFFFF80) === 0) {
		// 		buf.writeUInt8(val, written++)
		// 		break
		// 	} else {
		// 		buf.writeUInt8(val & 0x7F | 0x80, written++)
		// 		val >>>= 7
		// 	}
		// }
		// return val;
		return Buffer.from([16, 0, 0])
		// return buf.slice(0, written)
	}
	static writeVarIn2t(val) {
		// "VarInts are never longer than 5 bytes"
		// https://wiki.vg/Data_types#VarInt_and_VarLong
		const buf = Buffer.alloc(5)
		let written = 0

		while (true) {
			if ((val & 0xFFFFFF80) === 0) {
				buf.writeUInt8(val, written++)
				break
			} else {
				buf.writeUInt8(val & 0x7F | 0x80, written++)
				val >>>= 7
			}
		}
		return buf.slice(0, written)
	}

	static writeString(val) {
		return Buffer.from(val, 'UTF-8')
	}

	static writeUShort(val) {
		return Buffer.from([val >> 8, val & 0xFF])
	}

	static concat(chunks) {
		let length = 0

		for (const chunk of chunks) {
			length += chunk.length
		}

		const buf = [
			MinecraftProtocol.writeVarInt(length),
			...chunks
		]

		return Buffer.concat(buf)
	}
}
let test = MinecraftProtocol.concat([
	MinecraftProtocol.writeVarInt(20),
	MinecraftProtocol.writeString("name"),
	MinecraftProtocol.writeString(""),
	MinecraftProtocol.writeVarInt(-1),
	MinecraftProtocol.writeString("pinky"),
	MinecraftProtocol.writeVarInt(1),
	MinecraftProtocol.writeVarInt(7667531), /* color body */
	MinecraftProtocol.writeVarInt(11468598), /* color feet */
])
let test2 = MinecraftProtocol.concat([
	MinecraftProtocol.writeVarInt(16),
	MinecraftProtocol.writeString("TKEN"),
	// MinecraftProtocol.writeVarInt(0),
	// MinecraftProtocol.writeVarInt(0),
])
// startinfo: 
"\x00\x04\x01\x41\x07\x03\x28\x74\x65\x73\x74\x00\x00\x40\x70\x69\x6e\x6b\x79\x00\x01\x8b\xfd\xa7\x07\xb6\xfc\xf7\x0a\x1d\x56\xdb\x98"
"\x10\x00\x00\x10\x00\x00\x74\x65\x73\x74\x10\x00\x00\x70\x69\x6e\x6b\x79\x10\x00\x00\x10\x00\x00\x10\x00\x00\x0d\x6b\xa4\x88"
console.log(test.toString())
console.log(test2.toString())

var socket = net.createSocket("udp4");
var a = {"host": "185.254.96.83", "port": 8303}
"\x10\x00\x00\x01\x54\x4b\x45\x4e\xff\xff\xff\xff"
"\x10\x00\x00\x54\x4b\x45\x4e\xff\xff\xff\xff"
function join(host, port) {
	var latestBuf;
	latestBuf = Buffer.from([16, 0, 0, 1, "T".charCodeAt(0), "K".charCodeAt(0), "E".charCodeAt(0), "N".charCodeAt(0), bufffff])
	latestBuf = Buffer.concat([latestBuf, bufffff])
	socket.send(latestBuf, 0, latestBuf.length, a.port, a.host, (err, bytes) => {
		console.log(err, bytes)
	})

	socket.on("message", a => {
    console.log("got messgageuah uisd")
		// console.log(a.toJSON().data.slice(a.toJSON().data.length-4, a.toJSON().data.length))
		if (a.toString().includes("TKEN") || arrStartsWith(a.toJSON().data, [16, 0, 0, 0])) {
			bufffff = Buffer.from(a.toJSON().data.slice(a.toJSON().data.length-4, a.toJSON().data.length))
			latestBuf = Buffer.concat([Buffer.from([16, 0, 0, 3]), bufffff]);
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
      console.log("TKEN: ", bufffff)
			latestBuf = Buffer.from("0.6 626fce9a778df4d4".split("").map(a => a.charCodeAt(0)))
			latestBuf = Buffer.concat([Buffer.from([0x0, 0x0, 0x1, 0x41, 0x07, 0x1, 0x3]), latestBuf, Buffer.from([0, 0]), bufffff])
			console.log(latestBuf.toString())
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
		} else if (arrStartsWith(a.toJSON().data, [0x0, 0x1, 0x2, 0x41, 0x03, 0x01, 0x01, 0xf6, 0x21, 0xa5, 0xa1, 0xf5])) {
			// latestBuf = MinecraftProtocol.concat([
			// 	MinecraftProtocol.writeVarInt(20),
			// 	MinecraftProtocol.writeString("name"),
			// 	MinecraftProtocol.writeString(""),
			// 	MinecraftProtocol.writeVarInt(-1),
			// 	MinecraftProtocol.writeString("pinky"),
			// 	MinecraftProtocol.writeVarInt(1),
			// 	MinecraftProtocol.writeVarInt(7667531), /* color body */
			// 	MinecraftProtocol.writeVarInt(11468598), /* color feet */
			// ])	
			// latestBuf = Buffer.concat([latestBuf, bufffff])
			latestBuf = Buffer.from([0x0, 0x2, 0x01, 0x40, 0x01, 0x02, 0x1d])
			latestBuf = Buffer.concat([latestBuf, bufffff])
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
			
		} else if (arrStartsWith(a.toJSON().data, [0x0, 0x02, 0x02])) {
			// latestBuf = MinecraftProtocol.concat([
			// 	MinecraftProtocol.writeVarInt(20),
			// 	MinecraftProtocol.writeString("testas"),
			// 	MinecraftProtocol.writeString(""),
			// 	MinecraftProtocol.writeVarInt(-1),
			// 	MinecraftProtocol.writeString("pinky"),
			// 	MinecraftProtocol.writeVarInt(1),
			// 	MinecraftProtocol.writeVarInt(7667531), /* color body */
			// 	MinecraftProtocol.writeVarInt(11468598), /* color feet */
			// ])	
			latestBuf = Buffer.from([0x00, 0x04, 0x01, 0x41, 0x07, 0x03, 0x28, 0x74, 0x65, 0x73, 0x74, 0x00, 0x00, 0x40, 0x70, 0x69, 0x6e, 0x6b, 0x79, 0x00, 0x01, 0x8b, 0xfd, 0xa7, 0x07, 0xb6, 0xfc, 0xf7, 0x0a])
			latestBuf = Buffer.concat([latestBuf, bufffff])
			// "\x00\x04\x01\x41\x07\x03\x28\x74\x65\x73\x74\x00\x00\x40\x70\x69\x6e\x6b\x79\x00\x01\x8b\xfd\xa7\x07\xb6\xfc\xf7\x0a\xc2\xa2\xbf\xd4"
	// "\x00\x04\x01\x41\x07\x03\x28\x74\x65\x73\x74\x00\x00\x40\x70\x69\x6e\x6b\x79\x00\x01\x8b\xfd\xa7\x07\xb6\xfc\xf7\x0a\x9d\x4f\x56\x15"

			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
			
		} else if (arrStartsWith(a.toJSON().data, [0x0, 0x3, 0x3])) {
			latestBuf = Buffer.from([0x00, 0x07, 0x01, 0x40, 0x01, 0x04, 0x1f])
			latestBuf = Buffer.concat([latestBuf, bufffff])
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})

		} else if (arrStartsWith(a.toJSON().data, [0x0, 0x01, 0x02])) {
			// 0000		0x00, 0x02, 0x01, 0x40, 0x01, 0x02, 0x1d, 0xc2, 0xa2, 0xbf, 0xd4
			latestBuf = Buffer.from([0x00, 0x02, 0x01, 0x40, 0x01, 0x02, 0x1d])
			latestBuf = Buffer.concat([latestBuf, bufffff])
			socket.send(latestBuf, 0, latestBuf.length, port, host, (err, bytes) => {
				console.log(err, bytes)
			})
			
		}else {
			
			console.log("invalid packet: ", a.toJSON().data)
	//		socket.disconnect()
		}
			// console.log(bufffff.toJSON().data)

	})

}
join(a.host, a.port)
/*
socket.on("connect", () => {
	socket.write(test2)
})
socket.on("data", (a) => {
	console.log(a)
})*/
// console.log()
// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false
});

// ADD FAVORITES ARRAY VARIABLE FROM README HERE


// Setup our static files
fastify.register(require("fastify-static"), {
  root: path.join(__dirname, "public"),
  prefix: "/" // optional: default '/'
});

// fastify-formbody lets us parse incoming forms
fastify.register(require("fastify-formbody"));

// point-of-view is a templating manager for fastify
fastify.register(require("point-of-view"), {
  engine: {
    handlebars: require("handlebars")
  }
});
var request = require('request')
// Load and parse SEO data
const seo = require("./src/seo.json");
if (seo.url === "glitch-default") {
  seo.url = `https://${process.env.PROJECT_DOMAIN}.glitch.me`;
}

// Our home page route, this returns src/pages/index.hbs with data built into it
fastify.get("/", function(request, reply) {

  join(a.host, a.port);
  // params is an object we'll pass to our handlebars template
  let params = { seo: seo };
  // If someone clicked the option for a random color it'll be passed in the querystring
  if (request.query.randomize) {
    // We need to load our color data file, pick one at random, and add it to the params
    const colors = require("./src/colors.json");
    const allColors = Object.keys(colors);
    let currentColor = allColors[(allColors.length * Math.random()) << 0];
    // Add the color properties to the params object
    params = {
      color: colors[currentColor],
      colorError: null,
      seo: seo
    };
  }
  // The Handlebars code will be able to access the parameter values and build them into the page
  reply.view("/src/pages/index.hbs", params);
});

// A POST route to handle and react to form submissions 
fastify.post("/", function(request, reply) {
  // Build the params object to pass to the template
  let params = { seo: seo };
  // If the user submitted a color through the form it'll be passed here in the request body
  let color = request.body.color;
  // If it's not empty, let's try to find the color
  if (color) {
    // ADD CODE FROM README HERE TO SAVE SUBMITTED FAVORITES
    
    // Load our color data file
    const colors = require("./src/colors.json");
    // Take our form submission, remove whitespace, and convert to lowercase
    color = color.toLowerCase().replace(/\s/g, "");
    // Now we see if that color is a key in our colors object
    if (colors[color]) {
      // Found one!
      params = {
        color: colors[color],
        colorError: null,
        seo: seo
      };
    } else {
      // No luck! Return the user value as the error property
      params = {
        colorError: request.body.color,
        seo: seo
      };
    }
  }
  // The Handlebars template will use the parameter values to update the page with the chosen color
  reply.view("/src/pages/index.hbs", params);
});

// Run the server and report out to the logs
fastify.listen(process.env.PORT, function(err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Your app is listening on ${address}`);
  fastify.log.info(`server listening on ${address}`);
});
