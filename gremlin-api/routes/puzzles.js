const express = require('express');
//const sound = require('sound-play');
const sound = require('play-sound')(opts = {player: "mplayer"})
const {loadPuzzles, storePuzzles, storeModule, readFile, broadcastMessage, pingAllPuzzles, loadSounds} = require('../utils/utils');

let router = express.Router();
const puzzlesContextRoot = '../assets/puzzles';
const soundsContextRoot = '../assets/sounds';

let systemContext = {
    puzzles: {},
    sounds: {},
    fn: {
        activatePuzzle: async (puzzle) => { 
            broadcastMessage({
                puzzle: puzzle.id,
                type: "activate"
            }) 
        },
        resetPuzzle: async (puzzle) => { 
            broadcastMessage({
                puzzle: puzzle.id,
                type: "reset"
            }) 
        },
        solvePuzzle: async (puzzle) => { 
            broadcastMessage({
                puzzle: puzzle.id,
                type: "solve"
            })     
        },
        failPuzzle: async (puzzle) => {
            broadcastMessage({
                puzzle: puzzle.id,
                type: "fail"
            }) 
        },
        getPuzzleState: async (puzzle) => { return {name: puzzle.name, status: "active"}},
        playSound: async (soundName) => { 
            let path = systemContext.sounds[soundName].path;

            console.log("PLAYING " + (soundsContextRoot + "/" + path));

            sound.play(soundsContextRoot + "/" + path, (err) => {
                if (err) {
                    console.error("FAILED TO PLAY SOUND: " + err);
                }
            });
        }
    }
}

let refreshCache = async () => {
    systemContext.puzzles = await loadPuzzles(puzzlesContextRoot);
    systemContext.sounds = await loadSounds(soundsContextRoot);
}

router.route('/')
    .get(async (req, res) => {
        return res.json(systemContext.puzzles);
    })
    .post(async (req, res) => {
        systemContext.puzzles[req.body.id] = req.body;

        // TODO Figure out how best to commit
        await storePuzzles(systemContext.puzzles, puzzlesContextRoot);

        return res.send();
    });

router.route('/:id')
    .get(async (req, res) => {
        return res.json(systemContext.puzzles[req.params.id]);
    })
    .put(async (req, res) => {
        systemContext.puzzles[req.params.id] = req.body;

        // TODO Figure out how best to commit
        await storePuzzles(systemContext.puzzles, puzzlesContextRoot);

        return res.send();
    })
    .delete(async (req, res) => {
        delete systemContext.puzzles[req.params.id];

        // TODO Figure out how best to commit
        await storePuzzles(systemContext.puzzles, puzzlesContextRoot);

        return res.send();
    });

router.route('/:id/handlers')
    .get(async (req, res) => {
        let puzzle = systemContext.puzzles[req.params.id];
        let script = await readFile(`${puzzlesContextRoot}/${puzzle.modulePath}`);

        res.setHeader('content-type', 'text/plain');
        return res.send(script);
    })
    .put(async (req, res) => {
        let puzzle = systemContext.puzzles[req.params.id];
        await storeModule(`${puzzlesContextRoot}/${puzzle.modulePath}`, req.body);

        return res.send();
    });

router.route('/:id/events')
    .get(async (req, res) => {
        res.status(404);
        return res.send("Unimplemented");
    })
    .post(async (req, res) => {
        let puzzle = systemContext.puzzles[req.params.id];
        puzzle.eventHandlers[req.body.eventType]({...systemContext, puzzle});
        return res.send();
    });

router.route('/:id/ping')
    .post(async (req, res) => {
	console.log("PING RECEIVED FROM " + systemContext.puzzles[req.params.id].name);
        systemContext.puzzles[req.params.id].lastPing = Date.now();

        // TODO Figure out how best to commit
        await storePuzzles(systemContext.puzzles, puzzlesContextRoot);

        return res.send();
    });

refreshCache();
setInterval(() => {
    pingAllPuzzles();
}, 15000);

module.exports = router;
