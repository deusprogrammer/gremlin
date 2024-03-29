let {loadUser, storeUser, randomUuid, listUsers} = require('../utils/utils');
let express = require('express');
let router = express.Router();

const usersContextRoot = '../assets/users';

router.route('/')
    .get(async (req, res) => {
        try {
            if (!req.user || !req.user.roles.includes("SUPER_USER")) {
                console.error("User lacks proper authentication")
                res.status(403);
                return res.send();
            }

            res.status(200);
            res.json(await listUsers(usersContextRoot));
        } catch (e) {
            console.error(e);
            res.status(500);
            return res.send();
        }
    })
    .post(async (req, res) => {
        try {
            if (!req.user || !req.user.roles.includes("SUPER_USER")) {
                console.error("User lacks proper authentication")
                res.status(403);
                return res.send();
            }

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

            delete user["password"];

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
            if (!req.user || (!req.user.username === req.params.id && !req.user.roles.includes("SUPER_USER"))) {
                console.error("User lacks proper authentication")
                res.status(403);
                return res.send();
            }

            await storeUser(req.body, usersContextRoot, true);

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

            if (user.password !== req.body.password) {
                res.status(401);
                return res.send();
            }

            let token = randomUuid();
            user.password = "";
            req.sessions[token] = {
                user,
                token,
                expires: Date.now() + (60 * 60 * 24 * 1000)
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