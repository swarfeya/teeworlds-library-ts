var fs = require('fs')
var proxies = fs.readFileSync(__dirname + "\\socks5.txt")
			.toString()
			.replace(/\r/g, "")
			.split("\n")
			.filter(a => a) // filter empty out
var Http = require('http');

function whitelist(proxy) {
	var req = Http.request({
		host: proxy.split(":")[0],
		// proxy IP
		port: parseInt(proxy.split(":")[1]),
		// proxy port
		method: 'GET',
		path: 'https://requestbin.io/1ogdovo1' // full URL as path
		}, function (res) {
			res.on('data', function (data) {
			console.log(data.toString());
		})
		req.on("error", () => {
		})
	});
	req.end();
	
}
for (var i = 0; i < 25; i++) {
	whitelist(proxies[i])
}