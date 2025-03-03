/**
 * Example script to showcase moving a bot with the library.
 * Moving might be a bit delayed!
 * For more information about moving, check out the documentation: https://github.com/swarfeya/teeworlds-library-ts/blob/main/docs/documentation.md#movement
 * 
 * Script is designed for the dm1 map in the left corner of the bottom middle part.
 * You can find a video demo of this script here:
 * https://github.com/user-attachments/assets/b8fd0d05-3fd3-4ec3-8403-868b582900f5
 */

const teeworlds = require('teeworlds')
let client = new teeworlds.Client("127.0.0.1", 8303, "nameless tee");

client.connect();

client.on("connected", () => {
	console.log("Connected!");
})

client.on("disconnect", reason => {
	// you got kicked from the server
	console.log("Disconnected: " + reason);
})

client.on("snapshot", (snap) => {
	let myId = client.SnapshotUnpacker.OwnID;
	const myChar = client.SnapshotUnpacker.getObjCharacter(
		myId
	);
	if (!myChar) {
		// could happen when the tee is in spectator mode or the client has not received snaps yet.
		console.log("character not found!");
		return;
	}
	const myDDNetChar = client.SnapshotUnpacker.getObjExDDNetCharacter(
		myId
	);
	if (myDDNetChar) {
		// ddnet char has been found

		if (myDDNetChar.m_FreezeEnd != 0) {
			// tee is frozen or deep-frozen
			client.game.Kill();
		}
	}
  
	// these coordinates are roughly the same as the ones you see when pressing ctrl+shift+d ingame
	const currentPlayerX = myChar.character_core.x / 32; 
	const currentPlayerY = myChar.character_core.y / 32;

	// log the current position
	console.log(currentPlayerX, currentPlayerY)
	

	if (currentPlayerY > 37) {
		if (currentPlayerX > 26 && currentPlayerX < 30) {
			client.movement.Jump(!client.movement.input.m_Jump);
			client.movement.RunLeft();
		}
	} else {
		client.movement.Reset();
	}

})

process.on("SIGINT", () => {
	client.Disconnect().then(() => process.exit(0)); // disconnect on ctrl + c
	// process.exit()
})
