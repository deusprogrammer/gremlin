var utils = require('./utils');

(async () => {
    let puzzles = await utils.loadPuzzles('../puzzles');
    console.log(puzzles);

    puzzles['microscope'].version = '1.1';
    console.log(puzzles);

    await utils.storePuzzles(puzzles, '../puzzles');
})();

(async () => {
    let puzzles = await utils.loadPuzzles('../puzzles');
    puzzles['dog'] = {
        name: "The Annoying Dog Puzzle",
        description: "Kick the dog to unlock a drawer",
        version: '1.0',
        type: 'DOG',
        modulePath: 'dog.js'
    };
    await utils.storePuzzles(puzzles, '../puzzles');

    let script = await utils.readFile('../puzzles/microscope.js');
    await utils.storeModule('../puzzles/dog.js', script);
})();