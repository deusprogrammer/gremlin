let {loadUser, storeUser, randomUuid} = require('../utils/utils');
let express = require('express');
let router = express.Router();

const usersContextRoot = '../assets/users';

router.route('/')
    .post(async (req, res) => {
        try {
            req.body.roles = ["USER"];
            await storeUser(req.body, usersContextRoot);
            res.status(200);
            res.send();
        } catch (e) {
            console.error(e);
            res.status(500);
            return res.send();
        }
    });

router.route('/:id')
    .get(async (req, res) => {
        try {
            let user = await loadUser(req.params.id, usersContextRoot);
            res.status(200);
            res.json(user);
        } catch (e) {
            console.error(e);
            res.status(500);
            return res.send();
        }
        
    })
    .put(async (req, res) => {
        try {
            if (!req.user || !req.user.roles.include("SUPER_USER")) {
                res.status(403);
                return res.send();
            }

            storeUser(req.body, usersContextRoot);

            res.status(200);
            return res.send();
        } catch (e) {
            console.error(e);
            res.status(500);
            return res.send();
        }
    });

router.route('/auth')
    .post(async (req, res) => {
        try {
            let user = await loadUser(req.body.username, usersContextRoot);

            console.log(user.password + " === " + req.body.password);

            if (user.password !== req.body.password) {
                res.status(401);
                return res.send();
            }

            let token = randomUuid();
            user.password = "";
            req.sessions[token] = {
                user,
                token,
                expires: Date.now() + 60 * 60 * 24
            };

            res.status(200);
            return res.json(req.sessions[token]);
        } catch (e) {
            console.error(e);
            res.status(500);
            return res.send();
        }
    });

module.exports = router;