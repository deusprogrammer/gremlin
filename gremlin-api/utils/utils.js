const fs = require('fs');
const dgram = require('dgram');

const validateHandlers = (eventHandlers) => {
    let allowedHandlers = ['complete', 'fail', 'activate'];

    // Validate
    allowedHandlers.forEach((handler) => {
        if (!handler in eventHandlers) {
            throw new Error('Invalid module');
        }
    });
};

const validateConfig = (config) => {
    let requiredFields = ['id', 'name', 'description', 'type', 'version', 'modulePath'];

    // Validate
    requiredFields.forEach((field) => {
        if (!field in config) {
            throw new Error(`Field ${field} is missing in config object`);
        }
    });
}

const validateUser = (user) => {
    let requiredFields = ['username', 'roles', 'password'];

    // Validate
    requiredFields.forEach((field) => {
        if (!field in user) {
            throw new Error(`Field ${field} is missing in config object`);
        }
    });
}

const readFile = (filename, encoding = 'utf8') => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, encoding, function(err, data) {
            if (err) {
                return reject(err);
            }
            return resolve(data);
        });
    })
};

const writeFile = (filename, data, encoding = 'utf8') => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, encoding, (err) => {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};

const createModule = (script) => {
    return new Function(script)();
}

const loadModule = async (modulePath) => {
    let script = await readFile(modulePath);
    return createModule(script);
};

const loadPuzzles = async (contextRoot) => {
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

const loadSounds = async (contextRoot) => {
    let soundJson = await readFile(`${contextRoot}/sounds.json`);
    let sounds = JSON.parse(soundJson);

    return sounds;
}

const storeModule = async (modulePath, script) => {
    let eventHandlers = createModule(script);

    // Validate
    validateHandlers(eventHandlers);

    await writeFile(modulePath, script);
};

const storePuzzles = async (puzzles, contextRoot) => {
    for (let puzzleId in puzzles) {
        let puzzle = {...puzzles[puzzleId]};
        delete puzzle['eventHandlers'];

        validateConfig(puzzle);
    }
    
    await writeFile(`${contextRoot}/puzzles.json`, JSON.stringify(puzzles, null, 5));
};

const broadcastMessage = async (message) => {
    let client = dgram.createSocket("udp4");
    let broadcastIp = "255.255.255.255";
    let port = 6234;

    let payload = JSON.stringify(message);

    client.bind(port, () => {
        client.setBroadcast(true);
        client.send(payload, 0, payload.length, port, broadcastIp, () => {
            client.close();
        });
    });
}

const pingAllPuzzles = async () => {
    await broadcastMessage({
        type: "ping",
        port: process.env.PORT | "8888"
    });
}

const resetAllPuzzles = async () => {
    let puzzles = await loadPuzzles(puzzlesContextRoot);

    puzzles.forEach((puzzle) => {
        broadcastMessage({
            type: "reset",
            puzzle: puzzle.id,
            port: process.env.PORT | "8888"
        });
    })
}

const encryptUser = async (unencryptedUser) => {
    let encryptedUserString = Buffer.from(JSON.stringify(unencryptedUser));
    return encryptedUserString.toString("base64");
}

const decryptUser = async (encryptedUserString) => {
    let decryptedUserString = Buffer.from(encryptedUserString, "base64");
    return JSON.parse(decryptedUserString.toString("ascii"));
}

const storeUser = async (user, contextRoot) => {
    //Validate user doesn't already exsist
    if (fs.existsSync(`${contextRoot}/${user.username}.json.b64`)) {
        throw new Error("User already exists");
      }

    // Validate user schema
    validateUser(user);
    let encryptedUserString = await encryptUser(user);
    await writeFile(`${contextRoot}/${user.username}.json.b64`, encryptedUserString);
}

const loadUser = async (username, contextRoot) => {
    let encryptedUserString = await readFile(`${contextRoot}/${username}.json.b64`);
    return decryptUser(encryptedUserString);
}

const randomUuid = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
    resetAllPuzzles,
    broadcastMessage,
    storeUser,
    loadUser,
    randomUuid
};
