let {resetAllPuzzles} = require('../utils/utils');
let express = require('express');
let router = express.Router();

router.route('/reset')
    .post(async (req, res) => {
        try {
            if (!req.user || !req.user.roles.include("SUPER_USER")) {
                res.status(403);
                return res.send();
            }

            resetAllPuzzles();
            res.status(200);
            return res.send();
        } catch (e) {
            console.error(e);
            res.status(500);
            return res.send();
        }
    });

module.exports = router;