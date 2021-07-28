console.clear();
const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const { users, chkUser, joinUser, removeUser } = require('./users');
app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});
const testRoom = "test-room";
const t3Player = (function(players) {
    let index = 1,
        mark = ["X", "O"];
    return {
        next: function() {
            if (players.length == 2) {
                // change turns
                index = index ? 0 : 1;
                return {
                    name: users[index].userName,
                    mark: mark[index]
                };
            } else {
                // err
                console.log("a may hav exited abruptly, 2 users are not there in the room");
            }
        }
    };
})(users);




io.on("connection", function(socket) {
    console.log("connected");
    socket.on("join-room", (data) => {
        if (!chkUser(data.userName)) {
            io.to(socket.id).emit("send-data", { msg: "user already joined the room", id: socket.id });
            return;
        }

        if (users.length < 2) {
            // console.clear();
            console.log('in room');
            let newUser = joinUser(socket.id, data.userName, testRoom);
            //io.to(newUser.roomname).emit('send data' , {username : newUser.username,roomname : newUser.roomname, id : socket.id})
            // io.to(socket.id).emit('send data' , {id : socket.id ,username:newUser.username, roomname : newUser.roomname });
            socket.emit('send-data', { id: socket.id, userName: newUser.userName, roomName: newUser.roomName });
            socket.join(newUser.roomName);
            // console.log(users);
            if (users.length >= 2) {
                let nextTurn = t3Player.next();
                io.to(testRoom).emit("send-data", { msg: "room is full, enjoy T3", id: socket.id, player: nextTurn.name, mark: nextTurn.mark, t3Enabled: true });
                io.to(testRoom).emit("game-message", { id: socket.id, player: nextTurn.name, mark: nextTurn.mark, t3Enabled: true, t3New: true });
            }
        } else {
            io.to(socket.id).emit("send-data", { msg: "room is full, max 2 users allowed", id: socket.id });
        }
    });
    socket.on("chat-message", (data) => {
        io.to(testRoom).emit("chat-message", { msg: data.msg, userName: data.userName, id: socket.id });
    });
    socket.on("game-message", (data) => {
        let nextTurn = t3Player.next();
        // console.log("game-message", data);
        if (data.t3Playing) {
            io.to(testRoom).emit("game-message", { id: socket.id, player: nextTurn.name, mark: nextTurn.mark, clickedCellIndex: data.clickedCellIndex, t3Playing: true });
        } else if(data.t3New){
            io.to(testRoom).emit("game-message", { id: socket.id, player: nextTurn.name, mark: nextTurn.mark, t3New: true });
        }
    });
    socket.on("disconnect", () => {
        const user = removeUser(socket.id);
        if (user) {
            console.log('User ' + user.userName + ' has left');
        }
        console.log("disconnected");

    });
});

http.listen(3000, function() {
    console.log("chat server live @home:3000");
});