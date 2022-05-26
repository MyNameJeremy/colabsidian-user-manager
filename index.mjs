//import cfg from './config.json' assert { type: 'json' };

/** @returns {fasle} always false */
function ERR(...data) {
  console.error(data);
  return false;
}

/** @returns {false} always false */
function WARN(...data) {
  console.warn(...data);
  return false;
}

/**
 * @param {any} val value
 * @param {string} err_msg error message
 * @param {any} true_return value that is returned when val is truthy (default is val)
 * @param {any} false_return value that is returned when val is falsy (default is false)
 */
function ensure(val, err_msg, true_return = val, false_return = false) {
  return !!val ? true_return : ERR(err_msg) || false_return;
}

class user_manager {
  /** @type {Object.<string, User>} */
  users = {};
  /** @type {Object.<string, GeneralKey>}*/
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

    if (!this.users[name]) return ERR('invalid user name') || -1;

    const { hash: u_hash, useAuthKey: u_useAuthKey } = this.users[name];
    return hash === u_hash
      ? ((n) => {
          this.users[n].connections++;
          return this.users[n].perms;
        })(name)
      : ERR(`invalid user ${u_useAuthKey ? 'key' : 'password'}`) || -1;
  }

  /**
   * @param {GeneralKey} key the new general key
   * @returns {boolean}
   */
  add_key(key) {
    if (!!this.keys[key.hash]) WARN(`overwriting key ${key.hash}`);
    return !!(this.keys[key.hash] = key);
  }

  /**
   * @param {User} user
   * @returns {boolean}
   * * this function maybe should be wrapped by a handler that manages (a) db-connection(s)
   * * also only admins should be allowed to add or modify users
   */
  add_user(user) {
    if (!!this.users[user.name]) WARN(`overwriting user ${user.name}`);
    return !!(this.users[user.name] = user);
  }

  /**
   * @param {(User|GeneralKey)} userOrKey name of the user or an empty string
   * @returns {boolean} was the modification successful?
   */
  add_user_or_key(userOrKey) {
    let { hash, name } = userOrKey;
    return name === undefined
      ? !this.keys[hash]
        ? this.add_key(userOrKey)
        : ERR('key already exist')
      : !this.users[name]
      ? this.add_user(userOrKey)
      : ERR('user already exist');
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
   * @param {(User|GeneralKey)} userOrKey the User otr GeneralKey to be modified
   * @param {number} new_perms new permissions of a user or general key
   * @returns {boolean} was the modification successful?
   */
  modify_perms(userOrKey, new_perms) {
    let { hash, name } = userOrKey;
    return name === undefined
      ? !!this.keys[hash]
        ? this.modify_key_perms(hash, new_perms)
        : ERR('key does not exist')
      : !!this.users[name]
      ? hash === this.users[name].hash
        ? this.modify_user_perms(name, new_perms)
        : ERR('invalid hash')
      : ERR('user does not exist');
  }
}

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

