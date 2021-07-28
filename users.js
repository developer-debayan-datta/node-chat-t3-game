let users = [];

function joinUser(socketId, userName, roomName) {
    const user = {
        socketID: socketId,
        userName: userName,
        roomName: roomName
    }
    users.push(user)
    return user;
}

function chkUser(userName) {
    const un = users => users.userName === userName;
    return users.findIndex(un) == -1 ? true : false;
}

function removeUser(id) {
    const getID = users => users.socketID === id;
    const index = users.findIndex(getID);
    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}
module.exports = { users, chkUser, joinUser, removeUser }