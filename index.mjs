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
  constructor(config) {
    /**
     * @type {Object.<string, User>}
     */
    this.users = {};

    /**
     * @type {Object.<string, GeneralKey>}
     */
    this.keys = {};

    for (const user of config.um.users) {
      this.users[user.name] = { ...user, connections: 0 };
    }

    for (const key of config.um.general_keys) this.keys[key.hash] = key;
  }

  /**
   * @param {string} name name of the user or an empty string
   * @param {string} hash cryptographic key or hash of a users password
   * @param {number} new_perm new permissions of a user or general key
   * @returns {boolean} was the modification successful?
   */
  login(name = '', hash) {
    let inc_con = (name) => {
      this.users[name].connections += 1;
      return this.users[name].perms;
    };

    if (name === '') return ensure(this.keys[hash], 'invalid general key', this.keys[hash].perms, -1);

    if (!this.users[name]) return console.error('invalid user name') || -1;

    const { hash: u_hash, useAuthKey: u_useAuthKey, perms: u_perms } = this.users[name];
    return ensure(hash === u_hash, `invalid user ${u_useAuthKey ? 'key' : 'password'}`, u_perms, -1);
  }

  /**
   * @param {GeneralKey} general_key the new general key
   * @returns {void}
   */
  add_general_key(key) {
    this.keys[key.hash] = key;
  }

  /**
   * @param {User} user
   * @returns {void}
   * * this function should be wrapped by a handler that retuerns a bool for
   * * success or failure and might also manage (a) db-connection(s) only admins
   * * should be allowed to add or modify users
   */
  add_user(user) {
    return ensure(!this.users[user.name], 'user already exists', (this.users[name] = user && true), false);
  }

  /**
   * @param {string} name name of the user or an empty string
   * @param {string} hash cryptographic key or hash of a users password
   * @param {number} new_perm new permissions of a user or general key
   * @returns {boolean} was the modification successful?
   */
  modify_perms(name = '', hash, new_perm) {
    if (name === '') return (this.keys[hash].perms = new_perm) && true;
    else if (hash === this.users[name].hash) return (this.users[name].perms = new_perm) && true;
    return false;
  }
}
