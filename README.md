# authorization-server
this is authorization server for login system


## Overview

* Port Number
    * Dev: `3030`
    * Prod: `8080`


## Key Variables
    * API_KEY: project authorization
    * SECRET: key element for one way compression
    * idToken: user info -> user Authentication
    * dataToken: service data (cart) -> data integration
    * accessToken: userAuthentication -> user Authorization

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


## References
* [base](https://medium.com/better-programming/authentication-and-authorization-using-jwt-with-node-js-4099b2e6ca1f)
