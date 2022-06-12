const cfg = require('./config.json');
const { UserManager, User, GeneralKey } = require('./UserManager');

const { App, serveFromFS, buildRes, getType } = require('./EZServer/EZServer');
import { Module } from './EZServer/modules/index';
import { REST } from './EZServer/modules/REST.js';

let app = new App('42069');

app.addModule(new Module('rest'), REST);

/** @type {User} */
let user;

app.rest.get('/user', (req, res) => {
  console.table({ method: 'GET', endpoint: '/user', req: req });
  buildRes(res, JSON.stringify(user), { code: 200, mime: getType('json') });
});
app.rest.put('/user', (req, res) => {
  console.table({ method: 'PUT', endpoint: '/user', req: req });
  buildRes(res, JSON.stringify(user), { code: 200, mime: getType('json') });
  req.on('data', (chunk) => {
    console.log(`Data chunk available: ${chunk}`);
    user = JSON.parse(chunk.toString());
  });
});

let serve_config = (req, res) => serveFromFS('./config.json', res);

app.addResolver('/', serve_config);
app.addResolver('/config', serve_config);

let um = new UserManager(cfg);

user = um.login('admin', '', false);
console.log(user);

let usr = new User('Name', 'Hash', 0, 1, false);
console.log("new User('Name', 'Hash', 0, 1, false)", usr);

let gk = new GeneralKey('Hash', 0);
console.log("new GeneralKey('Hash', 0)", gk);

