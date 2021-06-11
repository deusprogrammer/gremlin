const express = require('express');
const logger = require('morgan');

const puzzles = require('./routes/puzzles');
const system = require('./routes/system');
const users = require('./routes/users');

let sessions = {};

const middleware = (req, res, next) => {
    req.sessions = sessions;

    console.log("SESSIONS: " + JSON.stringify(sessions, null, 5));

    if (req.headers['Authorization']) {
        let [authType, token] = req.headers['Authorization'].split(" ");
        
        if (authType === "Bearer") {
            let session = sessions[token];

            if (!session || Date.now() > session.expires) {
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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', middleware, users);
app.use('/puzzles', middleware, puzzles);
app.use('/system', middleware, system);

module.exports = app;
