const express = require('express');
const {loadPuzzles, storePuzzles, storeModule, readFile, pingAllPuzzles} = require('../utils/utils');

let router = express.Router();
let contextRoot = '../assets/puzzles';

let systemContext = {
    puzzles: {},
    fn: {
        activatePuzzle: async (puzzle) => { console.log(`Activated ${puzzle.name}`) },
        resetPuzzle: async (puzzle) => { console.log(`Reset ${puzzle.name}`) },
        solvePuzzle: async (puzzle) => { console.log(`Solved ${puzzle.name}`) },
        failPuzzle: async (puzzle) => { console.log(`Failed ${puzzle.name}`) },
        getPuzzleState: async (puzzle) => { return {name: puzzle.name, status: "active"}},
        playSound: async (soundName) => { console.log(`Playing sound ${soundName}`)}
    }
}

let refreshCache = async () => {
    systemContext.puzzles = await loadPuzzles(contextRoot);
}

router.route('/')
    .get(async (req, res) => {
        return res.json(systemContext.puzzles);
    })
    .post(async (req, res) => {
        systemContext.puzzles[req.body.id] = req.body;

        // TODO Figure out how best to commit
        await storePuzzles(systemContext.puzzles, contextRoot);

        return res.send();
    });

router.route('/:id')
    .get(async (req, res) => {
        return res.json(systemContext.puzzles[req.params.id]);
    })
    .put(async (req, res) => {
        systemContext.puzzles[req.params.id] = req.body;

        // TODO Figure out how best to commit
        await storePuzzles(systemContext.puzzles, contextRoot);

        return res.send();
    })
    .delete(async (req, res) => {
        delete systemContext.puzzles[req.params.id];

        // TODO Figure out how best to commit
        await storePuzzles(systemContext.puzzles, contextRoot);

        return res.send();
    });

router.route('/:id/handlers')
    .get(async (req, res) => {
        let puzzle = systemContext.puzzles[req.params.id];
        let script = await readFile(`${contextRoot}/${puzzle.modulePath}`);

        res.setHeader('content-type', 'text/plain');
        return res.send(script);
    })
    .put(async (req, res) => {
        let puzzle = systemContext.puzzles[req.params.id];
        await storeModule(`${contextRoot}/${puzzle.modulePath}`, req.body);

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
        systemContext.puzzles[req.params.id].lastPing = Date.now();

        // TODO Figure out how best to commit
        await storePuzzles(systemContext.puzzles, contextRoot);

        return res.send();
    });

refreshCache();
setInterval(() => {
    pingAllPuzzles();
}, 15000);

module.exports = router;