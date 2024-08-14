export enum States {
	STATE_OFFLINE = 0,
	STATE_CONNECTING,
	STATE_LOADING,
	STATE_ONLINE,
	STATE_DEMOPLAYBACK,
	STATE_QUITTING,
	STATE_RESTARTING
}

export namespace NETMSG {

	enum NETMSG_Game {
		EX,
		SV_MOTD,
		SV_BROADCAST,
		SV_CHAT,
		SV_KILLMSG,
		SV_SOUNDGLOBAL,
		SV_TUNEPARAMS,
		SV_EXTRAPROJECTILE,
		SV_READYTOENTER,
		SV_WEAPONPICKUP,
		SV_EMOTICON,
		SV_VOTECLEAROPTIONS,
		SV_VOTEOPTIONLISTADD,
		SV_VOTEOPTIONADD,
		SV_VOTEOPTIONREMOVE,
		SV_VOTESET,
		SV_VOTESTATUS,
		CL_SAY,
		CL_SETTEAM,
		CL_SETSPECTATORMODE,
		CL_STARTINFO,
		CL_CHANGEINFO,
		CL_KILL,
		CL_EMOTICON,
		CL_VOTE,
		CL_CALLVOTE,
		CL_ISDDNETLEGACY,
		SV_DDRACETIMELEGACY,
		SV_RECORDLEGACY,
		UNUSED,
		SV_TEAMSSTATELEGACY,
		CL_SHOWOTHERSLEGACY,
		NUM
	}

	enum NETMSG_Sys {
		NETMSG_EX = 0,

		// the first thing sent by the client
		// contains the version info for the client
		NETMSG_INFO = 1,

		// sent by server
		NETMSG_MAP_CHANGE, // sent when client should switch map
		NETMSG_MAP_DATA, // map transfer, contains a chunk of the map file
		NETMSG_CON_READY, // connection is ready, client should send start info
		NETMSG_SNAP, // normal snapshot, multiple parts
		NETMSG_SNAPEMPTY, // empty snapshot
		NETMSG_SNAPSINGLE, // ?
		NETMSG_SNAPSMALL, //
		NETMSG_INPUTTIMING, // reports how off the input was
		NETMSG_RCON_AUTH_STATUS, // result of the authentication
		NETMSG_RCON_LINE, // line that should be printed to the remote console

		NETMSG_AUTH_CHALLANGE, //
		NETMSG_AUTH_RESULT, //

		// sent by client
		NETMSG_READY, //
		NETMSG_ENTERGAME,
		NETMSG_INPUT, // contains the inputdata from the client
		NETMSG_RCON_CMD, //
		NETMSG_RCON_AUTH, //
		NETMSG_REQUEST_MAP_DATA, //

		NETMSG_AUTH_START, //
		NETMSG_AUTH_RESPONSE, //

		// sent by both
		NETMSG_PING,
		NETMSG_PING_REPLY,
		NETMSG_ERROR,

		// sent by server (todo: move it up)
		NETMSG_RCON_CMD_ADD,
		NETMSG_RCON_CMD_REM,

		NUM_NETMSGS,

		NETMSG_WHATIS = 65536,
		NETMSG_ITIS,
		NETMSG_IDONTKNOW,

		NETMSG_RCONTYPE,
		NETMSG_MAP_DETAILS,
		NETMSG_CAPABILITIES,
		NETMSG_CLIENTVER,
		NETMSG_PINGEX,
		NETMSG_PONGEX,
		NETMSG_CHECKSUM_REQUEST,
		NETMSG_CHECKSUM_RESPONSE,
		NETMSG_CHECKSUM_ERROR,

		NETMSG_REDIRECT,

		NETMSG_I_AM_NPM_PACKAGE

	}

	export const Game = NETMSG_Game;
	export const System = NETMSG_Sys;
}