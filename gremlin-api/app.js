const express = require('express');
const logger = require('morgan');
const cors = require('cors');

const puzzles = require('./routes/puzzles');
const system = require('./routes/system');
const users = require('./routes/users');

let sessions = {};

const middleware = (req, res, next) => {
    req.sessions = sessions;

    console.log("SESSIONS: " + JSON.stringify(sessions, null, 5));

    console.log("Headers:");
    Object.keys(req.headers).forEach((key) => {
        console.log("\t" + key + " => " + req.headers[key]);
    })

    if (req.headers['authorization']) {
        let [authType, token] = req.headers['authorization'].split(" ");
        
        if (authType === "Bearer") {
            let session = sessions[token];

            if (!session) {
                console.error("No session found");
                res.status(401);
                return res.send();
            }

            if (Date.now() > session.expires) {
                console.error("Expired token");
                res.status(401);
                return res.send();
            }

            req.user = session.user;
        }
    }

    next();
}

const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', middleware, users);
app.use('/puzzles', middleware, puzzles);
app.use('/system', middleware, system);

module.exports = app;
