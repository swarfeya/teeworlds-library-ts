
import { EventEmitter } from "stream";
import { MsgPacker } from "../MsgPacker";
import { MsgUnpacker } from "../MsgUnpacker";
import { Client } from "../client";
import { NETMSG } from "../enums_types/protocol";
import { Chunk, RconCommand } from "../enums_types/types";

interface RconEvents {
    rcon_line: (line: string) => void;
    rcon_auth_status: (info: {AuthLevel: number, ReceiveCommands: number}) => void;
    rcon_cmd_add: (info: {command: string, description: string, params: string}) => void;
    rcon_cmd_rem: (info: {command: string}) => void;
}


export class Rcon extends EventEmitter {
	on<K extends keyof RconEvents>(event: K, listener: RconEvents[K]): this {
		return super.on(event, listener);
	}
	
	emit<K extends keyof RconEvents>(event: K, ...args: Parameters<RconEvents[K]>): boolean {
		return super.emit(event, ...args);
	}

	CommandList: RconCommand[] = [];
	
	
	private _client: Client;
	constructor(_client: Client) {
		super();
		this._client = _client;
	}

	// SendMsgEx: (Msgs: MsgPacker[] | MsgPacker) => void;
	private send(packer: MsgPacker | MsgPacker[]) {
		if (!this._client.options?.lightweight)
			this._client.QueueChunkEx(packer);
		else
			this._client.SendMsgEx(packer);

	}
	public auth(username: string, password: string): void;
	public auth(password: string): void;

	
	/** Rcon auth, set the `username` to empty string for authentication w/o username **/
	auth(usernameOrPassword: string, password?: string) {
		const rconAuthMsg = new MsgPacker(NETMSG.System.NETMSG_RCON_AUTH, true, 1);
		if (password == undefined) {
			rconAuthMsg.AddString("");
			rconAuthMsg.AddString(usernameOrPassword);
			
		} else {
			rconAuthMsg.AddString(usernameOrPassword);
			rconAuthMsg.AddString(password);
		}
		rconAuthMsg.AddInt(1);
		this.send(rconAuthMsg);
	}

	/** Send rcon command **/
	rcon(cmds: string[] | string) {
		let _cmds: string[];
		if (cmds instanceof Array) _cmds = cmds
		else _cmds = [cmds];
		const msgs: MsgPacker[] = [];
		_cmds.forEach((cmd) => {
			const rconCmdMsg = new MsgPacker(NETMSG.System.NETMSG_RCON_CMD, true, 1);
			rconCmdMsg.AddString(cmd);
			msgs.push(rconCmdMsg);
		})
		this.send(msgs);
	}
	/** This method is called by the Client to handle the chunks. It should not be called directly. */
	_checkChunks(chunk: Chunk): boolean {
		if (chunk.msgid == NETMSG.System.NETMSG_RCON_LINE) {
			const unpacker = new MsgUnpacker(chunk.raw);
			const msg = unpacker.unpackString();
			this.emit('rcon_line', msg);
			
		} else if (chunk.msgid == NETMSG.System.NETMSG_RCON_AUTH_STATUS) {
			const unpacker = new MsgUnpacker(chunk.raw);
			const AuthLevel = unpacker.unpackInt();
			const ReceiveCommands = unpacker.unpackInt();
			this.emit('rcon_auth_status', {AuthLevel, ReceiveCommands});
		} else if (chunk.msgid == NETMSG.System.NETMSG_RCON_CMD_ADD) {
			const unpacker = new MsgUnpacker(chunk.raw);
			const command = unpacker.unpackString();
			const description = unpacker.unpackString();
			const params = unpacker.unpackString();

			this.CommandList.push({command, description, params});

			this.emit('rcon_cmd_add', {command, description, params});
		} else if (chunk.msgid == NETMSG.System.NETMSG_RCON_CMD_REM) {
			const unpacker = new MsgUnpacker(chunk.raw);
			const command = unpacker.unpackString();
			this.emit('rcon_cmd_rem', {command});

			let index = this.CommandList.findIndex(a => a.command == command);
			if (index -1 >= 0)
				this.CommandList.splice(index, 1);
		} 
		else {
			return false;
		}
		return true;
	}

	


}