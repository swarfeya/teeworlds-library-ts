*version used for this documentation is 2.4.7. Versions below / above that possibly have other syntax.*
<!-- <details> <summary>Events</summary> -->

# Events
* [connected](#event-connected)
* [disconnect](#event-disconnect)
* [emote](#event-emote)
* [message](#event-chat-message)
* [broadcast](#event-broadcast-message)
* [motd](#event-motd-motto-of-the-day)
* [kill](#event-kill)
* [map_details](#ddnet-event-map-details)
* [capabilities](#ddnet-event-capabilities)
* [snapshot](#event-snapshot)

## Snapshot events
These events are accessable using client.SnapUnpacker.on("event", ..)
###### TODO: make this more clearer with examples
* common
	* probably only exists to show for the type (x, y).
* explosion
	* grenade explosion event
* spawn
	* player spawn event
* hammerhit
* death
	* player death event
* sound_global
* sound_world
* damage_indicator

### Event: Connected
This event will be fired as soon as the client is connected (specifically when it got 2 snapshot packets).
```
client.on("connect", () => console.log("Client connected!"));
```

### Event: Disconnect
This event will be fired as soon as the client is kicked. It will also return the reason. 
```
client.on("disconnect", (reason: string) => console.log("Client disconnected. reason: " + reason));
```

### Event: Emote
This event will be fired as soon as anybody on the server sends an emote (or possibly, depending on the server's implementation, only from players near you). 
```
client.on("emote", (emote) => console.log(emote)); 
/*{
  client_id: 0,
  emoticon: 7,
  author: { ClientInfo: { .. }, PlayerInfo: { .. } }
}*/
```

### Event: Chat message
This event will be fired as soon as anybody on the server sends an chat message. 
```
client.on("message", (message) => console.log(message)); 
/*{
  team: 0,
  client_id: 0,
  message: 'Hello World!',
  author: { ClientInfo: { .. }, PlayerInfo: { .. } }
}*/

// server messages also do not have an author attribute and will always have an client_id of -1.:

/*{
  team: 0,
  client_id: -1,
  message: 'please visit DDNet.org or say /info and make sure to read our /rules'
}*/
```

### Event: Broadcast message
This event will be fired as soon as your client receives an broadcast message. 
```
client.on("broadcast", (message: string) => console.log(message)); 
// (f2 "broadcast Hello World!")
// Hello World!
```

### Event: Motd (Motto of the day)
This event will be fired as soon as your client receives an motd message. Usually right after your client is connected. 
```
client.on("broadcast", (message: string) => console.log(message)); 
// Testserver with DDraceNetwork Features!\nDon't forget to check server rules by using /rules!
```

### Event: Kill
This event will be fired as soon as anybody on the server dies. 
```
client.on("kill", (message) => console.log(message)); 
/*{
  killer_id: 0,
  victim_id: 0, // killer_id == victim_id, its a suicide
  weapon: -2,
  special_mode: 0,
  victim: { ClientInfo: { .. }, PlayerInfo: { .. } },
  killer: { ClientInfo: { .. }, PlayerInfo: { .. } }
  }
}*/
```

### DDNet Event: Map Details
This event will be fired when the client joins the server. This event only exists on ddnet-based servers. 
```
client.on("map_details", (message) => console.log(message)); 
/*{
  map_name: 'Firewatch',
  map_sha256: <Buffer b7 17 80 52 1b 38 16 b3 8d 37 6b a8 84 c6 26 ef 48 db 93 7c 57 c1 8b e8 4b f9 7e e0 94 33 d6 f7>,
  map_crc: 1834546968,
  map_url: '' // empty, because official ddnet servers dont send their map url, only some non-ddnet servers (for example |*KoG*| servers) do.
}*/
```

### DDNet Event: Capabilities
This event will be fired when the client joins the server. This event only exists on ddnet-based servers. 
```
client.on("capabilities", (message) => console.log(message)); 
/*{
  ChatTimeoutCode: true,
  AnyPlayerFlag: true,
  PingEx: true,
  AllowDummy: true,
  SyncWeaponInput: true
}*/
```

### Event: Snapshot
This event will be fired whenever the client receives an snapshot packet (which is up to 25 times per second!).
```
client.on("snapshot", (items) => console.log(items)); 
/* returns a list of all items that are being stored. */
```


<!-- </details> -->

# Game functions

accessable using client.game
methods:
* Say(message: string, team = false) 
	- sends the specified `message` in the chat.
* SetTeam(team: number) 
	- sets the client in a specific team (-1 spectator team, 0 team red/normal team, 1 team blue)
* SpectatorMode(SpectatorID: number) 
	- spectate a specific player id, if our client already in spectator mode 
* ChangePlayerInfo(playerInfo: ClientInfo) 
	- changes the current player info (name, clan, etc.)
* Kill() 
	- kills the client
* Emote(emote: number) 
	- sends an emote
* Vote(vote: boolean) 
	- votes on an currently running vote
* CallVoteOption(Value: string, Reason: string) 
	- call an option vote (on ddnet servers, for example an map vote)
* CallVoteKick(PlayerID: string|number, Reason: string) 
	- sends kick vote for an specific player id
* CallVoteSpectate(PlayerID: string|number, Reason: string) 
	- sends vote to set an specific player into spectator mode
* (IsDDNetLegacy() -- unused, probably used to verify the client is running on ddnet?) 
* Ping(): Promise\<number> 
	- pings the server and returns the latency in an Promise


# Snapshot 
* Snapshots are used to deliver most of the information of players. You can access all objects using `client.SnapshotUnpacker.*`
* the SnapshotUnpacker is built with two methods per object: 
	* getObjX(id: number) - returns the object with the specified id.
	* AllObjX - attribute, which returns all objects of the type in an array.

## Player/Character information
* [ClientInfo](#clientinfo)
* [PlayerInfo](#playerinfo)
* [Character](#character)
* [DDNetCharacter](#ddnetcharacter)
* [OwnID](#ownid)

<details><summary>other snapshot objects</summary>
	
	* PlayerInput
		* most servers probably dont use this
	* Projectile
	* Laser
	* Pickup
		* (Weapon Pickups)
	* Flag
		* Red/Blue Flag
	* GameInfo
	* GameData
	* CharacterCore
		* probably only used inside of the Character object and not sent by itself. 
	* [Character](#character)
	* [PlayerInfo](#playerinfo)
	* [ClientInfo](#clientinfo)
	* SpectatorInfo
	* MyOwnObject
		* extended type by ddnet used for testing.
	* [DDNetCharacter](#ddnetcharacter)
		* extended type by ddnet
	* ExGameInfo
		* extended type by ddnet
	* DDNetProjectile
		* extended type by ddnet
	* ExLaser
		* extended type by ddnet
	
	
</details>

### ClientInfo 
The ClientInfo Object (accessable using `client.SnapshotUnpacker.getObjClientInfo(player_id)` or `client.SnapshotUnpacker.AllObjClientInfo`) contains some of the essential client information. Example ClientInfo object: 
```
{
	name: 'Swarfey',
	clan: '',
	country: 276,
	skin: 'coala_toptri',
	use_custom_color: 0,
	color_body: 4718592,
	color_feet: 5046016,
	**id: 0**
} 
```

*The **ID** (player id) is essential for all player-specific informations.*

### PlayerInfo
The PlayerInfo Object (`client.SnapshotUnpacker.getObjPlayerInfo(player_id)` / `client.SnapshotUnpacker.AllObjPlayerInfo`) contains information like the ping, 
Example PlayerInfo object: 
```
{ local: 0, client_id: 0, team: 0, score: -901, latency: 0 } 
```

*Note*: The Ping ("latency") will always be 0, if the scoreboard is not "opened". To open it, you can use client.movement.FlagScoreboard(true). If you do not need the information anymore, you can always "close" it by passing false as a paremeter.
 

### Character
The character includes information like the current position of the player
example client.SnapshotUnpacker.getObjCharacter(id): 
```
{
  character_core: {
    tick: 247926,
    x: 700,
    y: 1201,
    vel_x: 1,
    vel_y: 0,
    angle: 1032,
    direction: 0,
    jumped: 0,
    hooked_player: -1,
    hook_state: 0,
    hook_tick: 6,
    hook_x: 700,
    hook_y: 1201,
    hook_dx: -160,
    hook_dy: -200
  },
  player_flags: 1,
  health: 0,
  armor: 0,
  ammo_count: 0,
  weapon: 1,
  emote: 0,
  attack_tick: 24714,
  client_id: 0
}
```
*Note*: all coordinates differ from the one you see in the debug menu ingame. When ingame, it always is divided by 32.

### DDNetCharacter
example client.SnapshotUnpacker.getObjExDDNetCharacter(id):
```
{
  m_Flags: 114688,
  m_FreezeEnd: 255564,
  m_Jumps: 2,
  m_TeleCheckpoint: 0,
  m_StrongWeakID: 1,
  m_JumpedTotal: 0,
  m_NinjaActivationTick: -500,
  m_FreezeStart: 255415,
  m_TargetX: 62,
  m_TargetY: 352,
  id: 0
}
```
### OwnID
returns your own client id. Useful if you need any of your own information.

# Movement
The movement component is accessable using `client.movement`.
* RunLeft()
	* makes the client run left
* RunRight()
	* makes the client run right
* RunStop()
	* makes the client stop running (if he is)
* Jump(state?: boolean)
	* makes the client Jump. if the parameter is false, the bot will stop holding jump.
* Fire()
	* makes the client fire his weapon.
* Hook(state?: boolean)
	* makes the client hook. if the state parameter is false, he will stop holding hook.
* NextWeapon()
	* changes his current weapon to the next weapon.
* PrevWeapon()
	* changes his current weapon to the previous weapon.
* SetAim(x: number, y: number)
	* sets the aiming to the specified point.
* FlagPlaying(toggle = true)
* FlagInMenu(toggle = true)
* FlagChatting(toggle = true)
	* adds a chat bubble to the bot.
* FlagScoreboard(toggle = true)
	* useful if you also need the [latency of players](#playerinfo).
* FlagHookline(toggle = true)
	* shows a hookline for the bot.
* Reset()
	* resets all input back to default (0).


# Other useful things
* client.Disconnect() - disconnects the client.
* client.sendInput() - sends an input packet
* client.VoteOptionList - returns the whole vote list.
### You can also specify some options in the client constructor:
```
/*options: {
	identity?: ClientInfo,
	password?: string,
	ddnet_version?: {version: number, release_version: string},
	timeout?: number, // in ms
	NET_VERSION?: string,
	lightweight?: boolean // experimental, only sends keepalive's (sendinput has to be called manually)
}
*/
// client without options:
var client = new teeworlds.Client("127.0.0.1", 8303, "name");
// client with options:
var client = new teeworlds.Client("127.0.0.1", 8303, "name", {
	identity: {
		"name": "nameless bot",
		"clan": "",
		"skin": "eggp",
		"use_custom_color": 0,
		"color_body": 65408,
		"color_feet": 65408,
		"country": -1,
	}
});
// will create a client with the name "nameless bot", skin eggp, etc.

client.connect();
```

# Examples
You can find some of the examples in the [docs/examples](docs/examples/) folder.

# Projects using this library
*Note:* If you have or know any projects running using this library, please contact me so i can add them, or PR them yourself.

* A discord which is bridging all discord messages and ingame messages (currently closed source): https://discord.gg/MSYcjYvU6e
* DDNet / Teeworlds Chat Client, no game, just chatting by kiocode: https://github.com/k-i-o/CChat.TW
* https://github.com/vitorblue007/DDnet-chatbot
* https://github.com/Siraxa/DDNetSpectate/tree/master

