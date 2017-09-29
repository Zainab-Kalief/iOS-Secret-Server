//***********//
//~~~~~~SET UP~~~~~~//
const express = require('express')
const path = require('path')
const app = express()
const body_parser = require('body-parser')
const path = require('path')
app.use(body_parser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, './static')))
app.use(body_parser.json())
//**********//


//**********//
//~~~~~~DATA STORAGE~~~~~~//
var players = [] //creates players as they add thier join game
var db = [] //main db
var gameStatus = true //shuts off others from joining the game once it has began
var dbCopy = [] //used to store db before it resets

//~~~~~~backend admin variables~~~~~~//
var gameLogs = []
var gameTotalRaw = {}
var gameTotalFormatted = []
//**********//


//**********//
//~~~~~~API CALLS~~~~~~//
app.get('/stat', (request, response) => { //from backend admin
  gameTotalFormatted = []
  for (var player in gameTotalRaw) {
    gameTotalFormatted.push({name: player, score: gameTotalRaw[player]})
  }
  gameTotalFormatted.sort( (a, b) => {
    return b.score - a.score
  })
  response.json({team: players, status: gameStatus, logs: gameLogs, total: gameTotalFormatted})
})

app.get('/all', (request, response) => { //from client - iOS
  response.json({data: dbCopy})
})
app.get('/admin', (request, response) => { //from client - iOS
  response.json({data: players[0]})
})
//**********//


//~~~~~~SERVER CONNECTION~~~~~~//
const server = app.listen(8000, () => { console.log('listening on port  8000'); })


//**********//
//~~~~~~SOCKET IO~~~~~~//
const io = require('socket.io').listen(server)
io.sockets.on('connection', function (socket) {

  //1 - players join game
  socket.on('joinGame', function (data) {
    if(gameStatus) {  //preventing additional players from being added after the game has started
      if(!players.includes(data)) {
        players.push(data)
      }
      io.emit('allUsers', players)
      console.log('User joined chat')
    } else {
      console.log('access denied!!!');
    }
  })


  //2 - admin player starts the game
  socket.on("startGame", function (time) {
    gameStatus = false

    for (var i = 0; i < players.length; i++) { //create the db
      if(i == 0) {
        db.push({name: players[i], targets: {}, status: true}) //establish admin player who will also be the first user
      } else {
        db.push({name: players[i], targets: {}, status: false})
      }
      gameTotalRaw[players[i]] = 0
    }

    for (user of db) {
      for (val of players) {
        if (val != user.name) { user.targets[val] = 0  } //create targets
      }
    }

    console.log('Users just started game')
    io.emit("beginGame", db)

    setTimeout( () => { //first warning
      io.emit('timeWarning', 60)
      console.log('60 seconds left');
    }, Number(time) - 60000)
    setTimeout( () => { //second warning
      io.emit('timeWarning', 10)
      console.log('10 seconds left');
    }, Number(time) - 10000)
    setTimeout(function () { //end game
      io.emit("gameOver", db)
      console.log("End the game after this time");
      dbCopy = db
      players = []
      db = []
      gameStatus = true
    }, Number(time)) //the admin player determines when the game ends

  })


  //3 players fire shots
  socket.on("shotsFired", function (data) {
    for (user of db) {
      if(user.name == data.shooter) {
        if (data.target in user.targets) { //record shots fired
          user.targets[data.target] += 1
          io.emit("target", data.target)
        }
        //if player shoots themselves
        if (!(data.target in user.targets)) {
          io.emit("idiotShot", data.target)
        }
      }
    }

    //updating backend admin
    gameLogs.push(`${data.shooter} shot ${data.target}`)
    gameTotalRaw[data.shooter] += 1
  })

})
//**********//
