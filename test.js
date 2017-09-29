var arr = [ 'wura', 'tobi', 'Jason', 'hillary', 'tony ', 'james' ]
var db = []
for (user of arr) {
  db.push({ name: user,
  targets: {}  })
}
for (user of db) {
  for (val of arr) {
    if (val != user.name) {
      user.targets[val] = 0
    }

  }
}


console.log(db)
