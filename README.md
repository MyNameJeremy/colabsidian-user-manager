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

> 'um' and 'db' are seperate
> so you could use the same config file
> when you want to use a different DB sollution

User:

| key           | value  | description                                                       |
| ------------- | ------ | ----------------------------------------------------------------- |
| useAuthKey    | bool   | wether the user uses a cript. key to authenticate                 |
| name          | str    | name of the user                                                  |
| auth          | string | hash of the password or key                                       |
| maxConnection | number | maximum amount of simultanious connections logged in as this user |

### um (User Manager)

perms are stores as a number <!--TODO maybe add more perm options-->
in js numbers aren't ints, so you have to imagin
you can imagin each int bit beeing a flag for a perm

- reading is allways permitted
- files and folders are handeled the same

| bit | flag             |
| --- | ---------------- |
| 0   | write to file    |
| 1   | delete from file |
| 2   | create a file    |
| 3   | move a file      |
| 4   | delete file      |

the perm range is 0 - 31

so a user that is allowed to do everything would have the perm-value `31`
and a user that is only allowed to read, write & delte from files would have the perm-value `7`

## todo

read the todo.md to see what is in planning
(everything in the todo.md should be seen as beeing considered but not confirmed to be 'todo')

