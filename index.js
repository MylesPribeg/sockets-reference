const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require("socket.io")
const io = new Server(server)

const port = 3000

//Need this otherwise css doesn't link
app.use(express.static(__dirname))

app.get('/', (req, res) => {

  res.sendFile(__dirname + '/index.html')
})


// TODO problems with this middleware
// io.use((socket,next)=>{
//   const token = socket.handshake.auth.token;
//   console.log("token received:" + token)
// })

var userlist = []
var grouplist = new Map();

grouplist.set('myles', ['Group 1', 'Group 2'])
grouplist.set('luke',  ['Group 1', 'Group 3'])
grouplist.set('gabe',  ['Group 2'])


io.on('connection', (socket) =>{
  
  var id  = socket.handshake.auth.token
  // ^ possible to have it throw an error which the client can see
  // if username not valid
  
  // room is created when a socket joins it
  let usersGroups = grouplist.get(id)
  usersGroups.forEach((room) =>{
    console.log("id joined room: " + room)
    socket.join(room)
  })


  //send to others
  socket.broadcast.emit("user connected", id);
  //send to just connected socket
  userlist.push(id)
  socket.emit("userlist", userlist);
  socket.emit("grouplist", usersGroups)
  //console.log("sent grouplist: " + grouplist.get(id))

  socket.on('disconnect', () =>{
    console.log('a user disconnected: ' + socket.handshake.auth.token)
    let index = userlist.indexOf(id)
    if (index > -1){
      userlist.splice(index, 1)
    }
    io.emit("user disconnected", socket.handshake.auth.token)
  })

  socket.on('chat message', ({to, content, from}, callback) => {
    io.to(to).emit('chat message', {to, content, from})
    console.log('message: ' + content + " to: " + to + " from: " + from);
    callback({
      status: "ok"
    })
  })

  // socket.on("typing", ()=>{
  //   io.emit('typing')
  // })
  // socket.on("stopped typing", ()=>{
  //   io.emit('stopped typing')
  // })
  console.log('user ' + id +' connected');
})


//must be server.listen, not app.listen
// https://stackoverflow.com/questions/17696801/express-js-app-listen-vs-server-listen
server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
