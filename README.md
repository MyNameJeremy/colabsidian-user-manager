# ColabSidian User Manager

This is the repo for the custom user manager I am writing for ColabSidian.
It is used by the SyncServer backend of ColabSidian.

It has a default user.
Every connection to the sync server has permissions based on the given permissions for the user it is logged in as.
It uses the default user as a fallback/template when creating a new user.

There are 3 ways of logging in.

- username & password (has specific perms for a singular user) <!--? only one connection per user???? -->
- username & key (has specific perms for a singular user) <!--? sha256/RSA??? -->
- general key (has general perms for everyone with this key, so it can be used as a "guest" user) <!--? simple pass-phrase possible??? -->

The username-dependent login methods can be configured to allow a certain number of connections per user (default 1)

## Config

config.json:

```json
{
  "um": {
    "default_perms": 0,
    "general_keys": [],
    "users": []
  },
  "db": { "port": 1337 }
}
```

> 'um' and 'db' are separate, so you could use the same config file when you want to use a different DB solution.
> User:

| key            | value   | description                                                         |
| -------------- | ------- | ------------------------------------------------------------------- |
| useAuthKey     | bool    | whether the user authenticates with a cryptographic key             |
| name           | str     | name of the user                                                    |
| auth           | string  | password or key hash                                                |
| maxConnection  | number  | the maximum number of concurrent connections logged in as this user |

### um (User Manager)

Perms are stored as a number <!--TODO maybe add more perm options-->
In JS, numbers aren't ints. So you can imagine each int bit being a flag for a perm.

- Reading is always permitted.
- Files and folders are handled the same.

| bit | flag             |
| --- | ---------------- |
| 0   | write to file    |
| 1   | delete from file |
| 2   | create a file    |
| 3   | move a file      |
| 4   | delete file      |

The perm range is 0 - 31

So a user that is allowed to do everything would have the perm-value `31`
and a user that is only allowed to read, write & delte from files would have the perm-value `7`

## todo

Read the todo.md to see what is in planning.
(everything in the todo.md should be seen as being considered but not confirmed to be "todo").
