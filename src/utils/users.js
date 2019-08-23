const users = []

//adduser, removeUser , getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    //Clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase()

    //Validate
    if (!username || !room) {
        return { error: 'Username and room are required' }
    }

    //Check for existing user
    const userExists = users.find(user => {return user.room === room && user.username === username})
    console.log("userEx",userExists)
    if (userExists) {
        return { error: 'User Name is taken' }
    }

    //Store user
    const user = { id, username, room }
    users.push(user)
    return {user};

}

const removeUser = (id) => {
    const userIndex = users.findIndex(user => user.id === id)
    if (userIndex !== -1) {
        return users.splice(userIndex, 1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => user.id === id)
    
}
const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
    
}

module.exports ={
    addUser,
    removeUser,
    getUser ,
    getUsersInRoom
}