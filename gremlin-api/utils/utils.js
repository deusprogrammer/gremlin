const fs = require('fs');
const dgram = require('dgram');

let validateHandlers = (eventHandlers) => {
    let allowedHandlers = ['complete', 'fail', 'activate'];

    // Validate
    allowedHandlers.forEach((handler) => {
        if (!handler in eventHandlers) {
            throw new Error('Invalid module');
        }
    });
};

let validateConfig = (config) => {
    let requiredFields = ['id', 'name', 'description', 'type', 'version', 'modulePath'];

    // Validate
    requiredFields.forEach((field) => {
        if (!field in config) {
            throw new Error(`Field ${field} is missing in config object`);
        }
    });
}

let readFile = (filename, encoding = 'utf8') => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, encoding, function(err, data) {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    })
};

let writeFile = (filename, data, encoding = 'utf8') => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, encoding, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

let createModule = (script) => {
    return new Function(script)();
}

let loadModule = async (modulePath) => {
    let script = await readFile(modulePath);
    return createModule(script);
};

let loadPuzzles = async (contextRoot) => {
    // Load puzzles from config file
    let puzzleJson = await readFile(`${contextRoot}/puzzles.json`);
    let puzzles = JSON.parse(puzzleJson);

    for (let puzzleId in puzzles) {
        if (puzzleId === "_start") {
            continue;
        }

        // Load puzzle event handlers
        let puzzle = puzzles[puzzleId];
        puzzle.eventHandlers = await loadModule(`${contextRoot}/${puzzle.modulePath}`);

        // Validate
        validateHandlers(puzzle.eventHandlers);
    }

    return puzzles;
};

let loadSounds = async (contextRoot) => {
    let soundJson = await readFile(`${contextRoot}/sounds.json`);
    let sounds = JSON.parse(soundJson);

    return sounds;
}

let storeModule = async (modulePath, script) => {
    let eventHandlers = createModule(script);

    // Validate
    validateHandlers(eventHandlers);

    await writeFile(modulePath, script);
};

let storePuzzles = async (puzzles, contextRoot) => {
    for (let puzzleId in puzzles) {
        let puzzle = puzzles[puzzleId];
        delete puzzle['eventHandlers'];

        validateConfig(puzzle);
    }
    
    await writeFile(`${contextRoot}/puzzles.json`, JSON.stringify(puzzles, null, 5));
};

let pingAllPuzzles = async () => {
    await broadcastMessage({
        type: "initialize",
        port: process.env.PORT | "8888"
    });
}

let broadcastMessage = async (message) => {
    let client = dgram.createSocket("udp4");
    let broadcastIp = "10.0.0.255";
    let port = 6234;

    client.bind(port, () => {
        client.setBroadcast(true);
        client.send(JSON.stringify(message), 0, message.length, port, broadcastIp, () => {
            client.close();
        });
    });
}

module.exports = {
    readFile,
    writeFile,
    loadModule,
    loadPuzzles,
    loadSounds,
    storeModule,
    storePuzzles,
    pingAllPuzzles,
    broadcastMessage
};
