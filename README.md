# iOS-Secret-Server

## In server.js
* This shows the use of socket.io with node.js [express] as the server side and swift as the client side.
* This also shows api calls being made to the server from swift and the admin website.
* Another thing you will notice is that we are storing all data locally with arrays and objects.

## In /static/index.html
* This is used to show off the admin website of the game.
* This can be viewed by going to the local ip address entered by the admin user on port 8000 i.e. http://{{LOCAL IP}}:8000 [Note: Change the ip address in index.html on 12 to your local ip before viewing!]
* This page keeps track of the players stats and updates the admin website to reflect the stats of the game in real time.
* It retrieves its data by making an api call to the server side.

## Setup
* Install node js from [Node Website](http://nodejs.org/)
* Install nodemon by running this in your terminal:
      npm install -g nodemon
* Install all npm dependencies by running this in your terminal: [npm will install all dependencies required in our package.json]
      npm install

### To start the server in your terminal:
      nodemon server.js

#### To stop the server:
* control c in the terminal 
