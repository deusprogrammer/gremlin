let {initializeAllPuzzles} = require('../utils/utils');
let express = require('express');
let router = express.Router();

global.registeredPuzzles = {};

router.route('/reset')
    .post(async (req, res) => {
        await initializeAllPuzzles();
        res.status = 200;
        res.send();
    });

router.route('/register')
    .post(async (req, res) => {
        global.registeredPuzzles[req.body.puzzleName] = {
            ipAddress: req.body.ipAddress
        }
        res.status = 200;
        res.send();
    });

module.exports = router;