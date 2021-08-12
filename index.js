"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var process_1 = __importDefault(require("process"));
// import MsgPacker from './MsgPacker'
var client_1 = __importDefault(require("./client"));
var MsgPacker_1 = __importDefault(require("./MsgPacker"));
// var MsgPacker = require('./MsgPacker')
// var Client = require('./client')
var argv = process_1.default.argv.slice(2);
var a = { host: "51.210.171.47", port: 7303 };
if (argv.length)
    a = { host: argv[0].split(":")[0], port: parseInt(argv[0].split(":")[1]) };
var clients = [];
var killLoop;
// clients.push()
// var client = new Client(a.host, a.port, argv[1] ? argv[1] : "nameless tee");
// client.connect();
process_1.default.stdin.on("data", function (data) {
    data = data.slice(0, -2);
    if (data.toString().startsWith(";")) { // ; = command prefix
        var command = data.slice(1).toString().split(" ");
        console.log(command);
        if (command[0] == "vote" && parseInt(command[1]) != NaN) {
            console.log(parseInt(command[1]));
            var packer = new MsgPacker_1.default(24, false);
            packer.AddInt(parseInt(command[1]));
            clients.forEach(function (client) {
                if (client.State == 3)
                    client.SendMsgEx(packer, 1);
            });
        }
        else if (command[0] == "change" && command[1]) {
            try {
                var playerInfo = JSON.parse(fs.readFileSync(__dirname + "\\all.json").toString());
                // .toString()
                // .replace(/\r/g, "")
                // .split("\n")
                // if (!playerInfo[0])
                // return;
                playerInfo = playerInfo.filter(function (a) { return a.identity.name.toLowerCase().includes(command[1].replace(/_/g, " ").toLowerCase()); })[0];
                console.log(playerInfo);
                var packer = new MsgPacker_1.default(21, false); // changeinfo
                packer.AddString(playerInfo.identity.name); //m_pName);
                packer.AddString(playerInfo.identity.clan); //m_pClan);
                packer.AddInt(playerInfo.identity.country); //m_Country);
                packer.AddString(playerInfo.identity.skin); //m_pSkin);
                packer.AddInt(playerInfo.identity.use_custom_color ? 1 : 0); //m_UseCustomColor);
                packer.AddInt(playerInfo.identity.color_body); //m_ColorBody);
                packer.AddInt(playerInfo.identity.color_feet); //m_ColorFeet);
                clients.forEach(function (client) {
                    console.log(client.State, "state");
                    if (client.State == 3)
                        client.SendMsgEx(packer, 1);
                });
            }
            catch (e) {
                console.log(e);
            }
        }
        else if (command[0] == "kill") {
            var packer = new MsgPacker_1.default(22, false);
            clients.forEach(function (client) {
                if (client.State == 3)
                    client.SendMsgEx(packer, 1);
            });
        }
        else if (command[0] == "dk") {
            var packer = new MsgPacker_1.default(22, false);
            clients.forEach(function (client, i) {
                setTimeout(function (client) {
                    if (client.State == 3)
                        client.SendMsgEx(packer, 1);
                }, 50 * i, client);
            });
        }
        else if (command[0] == "killloop") {
            if (killLoop)
                clearInterval(killLoop);
            else
                killLoop = setInterval(function () {
                    var packer = new MsgPacker_1.default(22, false);
                    clients.forEach(function (client, i) {
                        setTimeout(function (client) {
                            if (client.State == 3)
                                client.SendMsgEx(packer, 1);
                        }, 50 * i, client);
                    }, 60 * clients.length);
                });
        }
        else if (command[0] == "team" && parseInt(command[1]) != NaN) {
            var packer = new MsgPacker_1.default(18, false);
            packer.AddInt(parseInt(command[1]));
            clients.forEach(function (client) {
                if (client.State == 3)
                    client.SendMsgEx(packer, 1);
            });
        }
        else if (command[0] == "emote" && parseInt(command[1]) != NaN) {
            var packer = new MsgPacker_1.default(23, false);
            packer.AddInt(parseInt(command[1]));
            clients.forEach(function (client) {
                if (client.State == 3)
                    client.SendMsgEx(packer, 1);
            });
        }
    }
    else {
        var packer = new MsgPacker_1.default(17, false);
        packer.AddInt(0); // team
        packer.AddString(data.toString() + '\n');
        clients.forEach(function (client) {
            if (client.State == 3)
                client.SendMsgEx(packer, 1);
        });
    }
});
process_1.default.on("SIGINT", function () {
    setTimeout(function () {
        process_1.default.exit();
    }, 2500);
    setInterval(function () {
        console.log("BYE! sending disconnect..");
        // console.log(JSON.stringify(clients.filter(client => client.State == 3)))
        if (JSON.stringify(clients.filter(function (client) { return client.State == 3; })) == "[]")
            process_1.default.exit();
        if (proxy)
            fs.writeFileSync(__dirname + "\\working.txt", workingProxies.map(function (a) { return a.host + ":" + a.port; }).join("\n"));
        clients.forEach(function (client) {
            if (client.State == 3)
                client.SendControlMsg(4).then(function () {
                    client.State = 0;
                    // process.exit()
                });
        });
    }, 500); // send disconnect every 500ms if not disconnected
});
var proxy = false;
var loginId = 0;
var fs = require('fs');
if (proxy) {
    var workingProxies = [];
    var proxies = fs.readFileSync(__dirname + "\\socks5.txt")
        .toString()
        .replace(/\r/g, "")
        .split("\n")
        .filter(function (a) { return a; }); // filter empty out
    var proxyOptions = proxies.map(function (a) { return a.split(":"); }).map(function (a) {
        if (a.length > 2)
            return { "host": a[0], "port": parseInt(a[1]), "userId": a[2], "password": a[3], "type": 5 };
        else
            return { "host": a[0], "port": parseInt(a[1]), "type": 5 };
    });
    process_1.default.setMaxListeners(proxies.length);
    var chatEvent = false;
    // if (argv.includes("proxies=true")) {
    for (var i = 0; i < proxies.length; i++) {
        // setTimeout((i) => {
        console.log("trying to join on " + i);
        clients.push(new client_1.default(a.host, a.port, argv[1] ? argv[1] : "nameless tee", i, proxyOptions[i]));
        clients[i].connect();
        clients[i].on("connected", function (clientId) {
            loginId++;
            if (!chatEvent) {
                chatEvent = true;
                clients[clientId].on("message", function (msg) {
                    console.log(msg);
                    var packer = new MsgPacker_1.default(22, false);
                    if (msg.message = "o") {
                        clients.forEach(function (client) {
                            if (client.State == 3)
                                client.SendMsgEx(packer, 1);
                        });
                    }
                });
                // })
            }
            // if (!workingProxies.map(a => `${a.host}:${a.port}`).includes(`${clients[clientId].proxy?.host}:${clients[clientId].proxy?.port}`) && clients[clientId].proxy)
            // workingProxies.push(clients[clientId].proxy);
            // console.log(client)
            console.log("connected with ", proxies[clientId]);
            // var packer = new MsgPacker(17, false);
            // packer.AddInt(0); // team
            // packer.AddString('yoyoyo\n');
            if (argv.includes("f4")) {
                var packer = new MsgPacker_1.default(24, false);
                packer.AddInt(-1);
                clients[clientId].SendMsgEx(packer, 1);
            }
            else if (argv.includes("f3")) {
                var packer = new MsgPacker_1.default(24, false);
                packer.AddInt(1);
                clients[clientId].SendMsgEx(packer, 1);
            }
            else {
                // var packer = new MsgPacker(17, false);
                // packer.AddInt(0); // team
                // packer.AddString('yoyoyo\n');
                var packer = new MsgPacker_1.default(17, false);
                packer.AddInt(0); // team
                console.log(loginId);
                // packer.AddString('/register coolguy' + loginId + ' nicepass nicepass\n');
                packer.AddString('/login coolguy' + loginId + ' nicepass\n');
                clients[clientId].SendMsgEx(packer, 1);
                setTimeout(function (clientId) {
                    var packer = new MsgPacker_1.default(17, false);
                    packer.AddInt(0); // team
                    packer.AddString('/register coolguy' + loginId.toString() + ' nicepass nicepass\n');
                    clients[clientId].SendMsgEx(packer, 1);
                    setTimeout(function (clientId) {
                        var packer = new MsgPacker_1.default(17, false);
                        packer.AddInt(0); // team
                        packer.AddString('/login coolguy' + loginId.toString() + ' nicepass\n');
                        clients[clientId].SendMsgEx(packer, 1);
                    }, 3500, clientId);
                }, 3500, clientId);
            }
        });
        // }, 50*i, i)
    }
    // }
}
else {
    clients.push(new client_1.default(a.host, a.port, argv[1] ? argv[1] : "nameless tee", 0));
    clients[0].connect();
    clients[0].on("connected", function (clientId) {
        loginId++;
        // console.log(client)
        console.log("connected!");
        // var packer = new MsgPacker(17, false);
        // packer.AddInt(0); // team
        // packer.AddString('yoyoyo\n');
        if (argv.includes("f4")) {
            var packer = new MsgPacker_1.default(24, false);
            packer.AddInt(-1);
            clients[clientId].SendMsgEx(packer, 1);
        }
        else if (argv.includes("f3")) {
            var packer = new MsgPacker_1.default(24, false);
            packer.AddInt(1);
            clients[clientId].SendMsgEx(packer, 1);
        }
        else {
            var packer = new MsgPacker_1.default(17, false);
            packer.AddInt(0); // team
            console.log(loginId);
            packer.AddString(loginId + 'test\n');
            // clients[clientId].SendMsgEx(packer, 1);
            setTimeout(function () {
                var packer = new MsgPacker_1.default(17, false);
                packer.AddInt(0); // team
                packer.AddString('/login coolguy' + loginId.toString() + ' nicepass\n');
                clients[clientId].SendMsgEx(packer, 1);
            }, 3500);
        }
    });
    clients[0].on("message", function (msg) {
        console.log(msg);
        var packer = new MsgPacker_1.default(22, false);
        if (msg.message = "o") {
            clients.forEach(function (client) {
                if (client.State == 3)
                    client.SendMsgEx(packer, 1);
            });
        }
    });
}
