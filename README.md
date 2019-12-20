# authorization-server
* this is authorization server for login system


## Overview

* Port Number
    * Dev: `3030`
    * Prod: `8080`

##
1. project get `clientId === API_KEY`
2. user signs up to get tmp accessId link
3. user requests the server to authorize and receives accessToken
4. user can sign with password and email later
5. user needs accessToken to change password
    * system check blacklist
    * any restricted resource manipulations need accessToken and server needs to the accessToken is not in the blacklist
6. user signs out and the token will be put in blacklist

## Key Variables
* API_KEY: project authorization
* SECRET: key element for one way compression
* idToken: user info -> user Authentication
* dataToken: service data (cart) -> data integration
* accessToken: userAuthentication -> user Authorization
    * same as password hash

## Data

#### User Profile
* username/account: email
* password
* fist and last name
* age
* occupation
* region
* dat and birth
* picture

#### Role/Permission
* roles
    1. admin: not available
    2. editor: assign by admin
    3. viewer: assign by admin
* implementation
    * scope of access token

## Terms
* client: project which use authorization-server as service
* user: single entity who use client as service


## To Do
* [ ] redis-database for token/session management
* [ ] set the scope of accessToken
* [ ] Temporary authorization url should be comprised with random string
* [x] signin
* [x] encrypt the credentials file
    * [ref](https://gist.github.com/kzap/5819745)
    * [ref](https://docs.travis-ci.com/user/encryption-keys/)
* [x] change password hash
* [x] return access token in authorization header
* [x] generate random access id for email confirmation
    * https://stackoverflow.com/questions/14576516/create-a-unique-id-for-email-confirmation
* [x] add jti to payload of accessToken and APIkey
    * use UUID ???
* [ ] corn job to delete accesslist and backlist
* [ ] checkIfUserAndAccessIdExist
    * validation: authorized true
    * error + response message
    * duplicated blacklist
* [x] change password
* [ ] signout
* [ ] forget password
* [x] signin need to check authorized key
* [x] changePassword need to check authorized key
* [x] authorize + signin -> block the old token ?
* [] csrf token
* [] tokenValidation need to check expiration date

## References
* [base](https://medium.com/better-programming/authentication-and-authorization-using-jwt-with-node-js-4099b2e6ca1f)
* authorization code flow
    * [OAUTH](https://www.oauth.com/oauth2-servers/server-side-apps/authorization-code/)
    * [AUTH0](https://auth0.com/docs/flows/concepts/auth-code)
