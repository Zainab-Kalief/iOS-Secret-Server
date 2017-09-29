var express = require('express')
var path = require('path')
var app = express()
var body_parser = require('body-parser')
var path = require('path')
app.use(body_parser.urlencoded({extended: true}))
app.use(express.static(path.join(__dirname, './static')))
app.use(body_parser.json())

var users = []
var db = []
var flipGame = true
var dbCopy = []
//route
app.get('/stat', (request, response) => {
  response.json(users)
})
app.get('/all', (request, response) => {
  console.log(dbCopy);
  response.json({data: dbCopy})
})
app.get('/admin', (request, response) => {
  response.json({data: users[0]})
})



var server = app.listen(8000, () => { console.log('listening on port  8000'); })
//socket
var io = require('socket.io').listen(server)
io.sockets.on('connection', function (socket) {


  socket.on('joinGame', function (data) {
    if(flipGame) {
      if(!users.includes(data)) {
        users.push(data)
      }
      io.emit('allUsers', users)
      console.log('User joined chat')
    } else {
      console.log('access denied!!!');
    }
  })


  socket.on("startGame", function (time) {
    for (var i = 0; i < users.length; i++) {
      if(i == 0) {
        db.push({name: users[i], targets: {}, status: true})
      } else {
        db.push({name: users[i], targets: {}, status: false})
      }
    }
    for (user of db) {
      for (val of users) {
        if (val != user.name) { user.targets[val] = 0   }
      }
    }
    flipGame = false
    console.log('Users just started game')
    io.emit("beginGame", db)
    // setTimeout( () => {
    //   io.emit('timeWarning', 60)
    // }, 80)
    setTimeout(function () { //end game
      io.emit("gameOver", db)
      console.log("End the game after this time");
      dbCopy = db
      users = []
      db = []
      flipGame = true
    }, Number(time))
  })


  socket.on("shotsFired", function (data) {
    for (user of db) {
      if(user.name == data.shooter) {
        var temp = user
        if (data.target in user.targets) {
          user.targets[data.target] += 1
          io.emit("target", data.target)
        }
      }
    }
    if (!(data.target in temp.targets)) {
      io.emit("idiotShot", data.target)
    }
  })

  socket.on('sendResult', function () {
    io.emit('receiveResult', db)

  })


})
