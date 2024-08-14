
import { MsgPacker } from "../MsgPacker";
import { SnapshotItemTypes } from "../snapshots";
import { Client } from "../client";

export class Game {
	// SendMsgEx: (Msgs: MsgPacker[] | MsgPacker) => void;
	private _client: Client;
	_ping_resolve: (_time: number) => void;
	constructor(_client: Client) {
		// this.SendMsgEx = callback;
		this._client = _client;
		this._ping_resolve = () => {};
	
	}
	private send(packer: MsgPacker) {
		if (!this._client.options?.lightweight)
			this._client.QueueChunkEx(packer);
		else
			this._client.SendMsgEx(packer);

	}

	Say(message: string, team = false) {
		var packer = new MsgPacker(NETMSG.Game.CL_SAY, false, 1);
		packer.AddInt(team ? 1 : 0); // team
		packer.AddString(message);
		this.send(packer);
	}

	
	/** Set the team of an bot. (-1 spectator team, 0 team red/normal team, 1 team blue) */
	SetTeam(team: number) { 
		var packer = new MsgPacker(NETMSG.Game.CL_SETTEAM, false, 1);
		packer.AddInt(team);
		this.send(packer);
	}
	
	
	/** Spectate an player, taking their id as parameter. pretty useless */
	SpectatorMode(SpectatorID: number) { 
		var packer = new MsgPacker(NETMSG.Game.CL_SETSPECTATORMODE, false, 1);
		packer.AddInt(SpectatorID);
		this.send(packer);
	}

	
	
	/** Change the player info */
	ChangePlayerInfo(playerInfo: SnapshotItemTypes.ClientInfo) { 
		var packer = new MsgPacker(NETMSG.Game.CL_CHANGEINFO, false, 1);
		packer.AddString(playerInfo.name); 
		packer.AddString(playerInfo.clan); 
		packer.AddInt(playerInfo.country);
		packer.AddString(playerInfo.skin); 
		packer.AddInt(playerInfo.use_custom_color ? 1 : 0); 
		packer.AddInt(playerInfo.color_body); 
		packer.AddInt(playerInfo.color_feet); 
		this.send(packer);
	}

	
	/** Kill */
	Kill() { 
		var packer = new MsgPacker(NETMSG.Game.CL_KILL, false, 1);
		this.send(packer);
	}

	
	/** Send emote */
	Emote(emote: number) { 
		var packer = new MsgPacker(NETMSG.Game.CL_EMOTICON, false, 1);
		packer.AddInt(emote);
		this.send(packer);
	}

	
	/** Vote for an already running vote (true = f3 /  false = f4) */
	Vote(vote: boolean) { 
		var packer = new MsgPacker(NETMSG.Game.CL_VOTE, false, 1);
		packer.AddInt(vote ? 1 : -1);
		this.send(packer);
	}

	private CallVote(Type: "option" | "kick" | "spectate", Value: string|number, Reason: string) { 
		var packer = new MsgPacker(NETMSG.Game.CL_CALLVOTE, false, 1);
		packer.AddString(Type); 
		packer.AddString(String(Value));
		packer.AddString(Reason);
		this.send(packer);
	}
	
	/** Call a vote for an server option (for example ddnet maps) */
	CallVoteOption(Value: string, Reason: string) { 
		this.CallVote("option", Value, Reason)
	}
	
	/** Call a vote to kick a player. Requires the player id */
	CallVoteKick(PlayerID: string|number, Reason: string) { 
		this.CallVote("kick", PlayerID, Reason)
	}
	
	/** Call a vote to set a player in spectator mode. Requires the player id */
	CallVoteSpectate(PlayerID: string|number, Reason: string) { 
		this.CallVote("spectate", PlayerID, Reason)
	}


	
	/** probably some verification of using ddnet client. */
	IsDDNetLegacy() { 
		var packer = new MsgPacker(NETMSG.Game.CL_ISDDNETLEGACY, false, 1);
		this.send(packer);
	}
	
	/** returns the ping in ms (as a promise) */
	Ping(): Promise<number> { 
		return new Promise((resolve, reject) => {
			var packer = new MsgPacker(22, true, 0);
			let startTime = new Date().getTime();
			this.send(packer);

			let callback = (_time: number) => {
				resolve(_time - startTime);
				this._ping_resolve = () => {};
			}
			this._ping_resolve = callback;
		})
	}
	

}