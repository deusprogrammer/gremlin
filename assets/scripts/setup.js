const {storeUser, randomUuid} = require('./utils');

// TODO Replace this with command line argument
const CONTEXT_ROOT = process.argv[2];
let password = randomUuid();

(async () => {
    let user = {
        username: "admin",
        password,
        roles: ["SUPER_USER"]
    }
    await storeUser(user, CONTEXT_ROOT + "/users");

    console.log("CREATED USER: " + JSON.stringify(user, null, 5));
    console.log("Please change password as soon as possible on admin console");
})();