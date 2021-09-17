# Onramp backend server #

Onramp backend server support user management, user transactions and crypto currency management  
 
## Installation ##
npm install

### Dependencies ###

In order to be able to start the application following software needs to be installed
 - NodeJS
 - MySQL

### Setup ###

In root application folder create folder with name `log`
In order to setup the application in **root application folder** run the following commands
 - `npm install`

### Configuration ###
All configuration parameters are stored in `config` folder. All configuration options are listed in `config.ENV.js` file. 
In order to make changes, simply override the file and restart the server.

### Running the app ###
To start the server run
Supported environment variables are
* **NODE_PORT** port on which the server will start, default is `3000`
* **NODE_ENV** enviroment for server configuration, default is `dev`
* **NODE_DB_HOST** Host where the database is
* **NODE_DB_NAME** Name of the database
* **NODE_DB_USER** Username for the database
* **NODE_DB_PASS** Password for the user on given database


`npm start` which will start node instance.

### How to run tests ###
In order to run the tests simply run `npm test`. NOT IMPLEMENTED YET.

### Docker ###
Create folder /var/log/onramp and give access to docker user.
Pull down the docker and run

- `docker run --ulimit nofile=500000:500000 --net host -d -v /var/log/onramp:/usr/src/app/log -e NODE_ENV=prod -e NODE_PORT=3000 -e NODE_DB_HOST=your-db-host -e NODE_DB_NAME=your-db-name -e NODE_DB_USER=your-db-user -e NODE_DB_PASS=your-db-pass --name=onramp realityshare/onramp:1.0.0`
