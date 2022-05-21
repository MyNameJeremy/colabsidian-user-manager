import cfg from './config.json' assert { type: 'json' };

/**
 * @typedef User
 * @type {Object}
 * @property {string} name name of the user
 * @property {string} hash users cryptographic key or hash of the users password
 * @property {number} perms permissions of the user
 * @property {number} maxConnection maximum amount of concurrent connections of a user
 * @property {boolean} useAuthKey is the user using a cryptographic key?
 *
 * @typedef GeneralKey
 * @type {Object}
 * @property {string} hash cryptographic key of the general key
 * @property {number} perms permissions of the general key
 */

/**
 * @param {any} val value
 * @param {string} err_msg error message
 * @param {any} true_return value that is returned when val is truthy (default is val)
 * @param {any} false_return value that is returned when val is falsy (default is false)
 */
function ensure(val, err_msg, true_return = val, false_return = false) {
  return !!val ? true_return : console.error(err_msg) || false_return;
}

class user_manager {
  /**
   * @type {Object.<string, User>}
   */
  users = {};
  /**
   * @type {Object.<string, GeneralKey>}
   */
  keys = {};

  constructor(config) {
    for (const user of config.um.users) this.users[user.name] = { ...user, connections: 0 };

    for (const key of config.um.general_keys) this.keys[key.hash] = key;
  }

  /**
   * @param {string} name name of the user or an empty string
   * @param {string} hash cryptographic key or hash of a users password
   * @return {number} permissions of the User / GeneralKey (-1 indicates login-failure)
   */
  login(hash, name = '') {
    if (name === '') return ensure(this.keys[hash], 'invalid general key', this.keys[hash].perms, -1);

    if (!this.users[name]) return console.error('invalid user name') || -1;

    const { hash: u_hash, useAuthKey: u_useAuthKey } = this.users[name];
    return hash === u_hash
      ? ((n) => {
          this.users[n].connections++;
          return this.users[n].perms;
        })(name)
      : console.error(`invalid user ${u_useAuthKey ? 'key' : 'password'}`) || -1;
  }

  /**
   * @param {GeneralKey} key the new general key
   * @returns {boolean}
   */
  add_general_key(key) {
    return !!(this.keys[key.hash] = key);
  }

  /**
   * @param {User} user
   * @returns {boolean}
   * * this function maybe should be wrapped by a handler that manages (a) db-connection(s)
   * * also only admins should be allowed to add or modify users
   */
  add_user(user) {
    return ensure(!this.users[user.name], 'user already exists', !!(this.users[user.name] = user), false);
  }

  /**
   * @param {string} name name of the user
   * @param {number} new_perms new permissions of the user
   * @returns {boolean} was the modification successful?
   */
  modify_user_perms(name, new_perms) {
    return !!(this.users[name].perms = new_perms);
  }

  /**
   * @param {string} hash cryptographic key
   * @param {number} new_perms new permissions of the general key
   * @returns {boolean} was the modification successful?
   */
  modify_key_perms(hash, new_perms) {
    return !!(this.keys[hash].perms = new_perms);
  }

  /**
   * @param {string} name name of the user or an empty string
   * @param {string} hash cryptographic key or hash of a users password
   * @param {number} new_perm new permissions of a user or general key
   * @returns {boolean} was the modification successful?
   */
  modify_perms(hash, new_perm, name = '') {
    if (name === '') return ensure(this.keys[hash], 'key does not exist', !!(this.keys[hash].perms = new_perm));
    return ensure(hash === this.users[name].hash, 'invalid hash', !!(this.users[name].perms = new_perm));
  }
}
