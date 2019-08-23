const http = require('http')
const express = require("express");
const path = require("path");
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users')
const app = express();
//The beloew line is automatically done by express
const server = http.createServer(app)
//Adding socket functionality
const io = socketio(server)


const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");
console.log(__dirname)
app.use(express.static(publicDirectoryPath));

let count = 0
//socket is an object that contains information about the connection
io.on('connection', (socket) => {
    console.log("New web socket conneciton")

    socket.on('join', ({ username, room },callback) => {
      
        const { error, user } = addUser({ id: socket.id, username, room })
        if (error) {
            console.log("Error",error)
          return callback(error)
        }
        console.log(user)
        socket.join(user.room)
        socket.emit("message", generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const filter = new Filter()
        if (filter.isProfane(msg)) {
            return callback('Profanity is not allowed')
        }
        const user= getUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage(user.username,msg))
            callback()
        }
      
    })

    socket.on('sendLocation', (coords, callback) => {
        const user= getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.lat},${coords.long}`))
        callback()
    })


    socket.on('disconnect', () => {
        const user= removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
        
    })

})



server.listen(port, () => {
    console.log(`Server is up on ${port}`);
});

