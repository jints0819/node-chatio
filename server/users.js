
class Users {
    constructor() {
        this.users = [];
    }
    addUser(id, name, room) {
        var user = { id, name, room };
        this.users.push(user);
        return user;
    }

    removeUser(id) {
        var userid = this.getUser(id);

        if (userid) {
            this.users = this.users.filter((user) => user.id !== id);
        }
        return userid;
    }

    getUser(id) {
        return this.users.filter((user) => user.id === id)[0]
    }

    getUserList(room) {
        var user_room = this.users.filter((user) => user.room === room);
        var namesArray = user_room.map((user) => user.name);

        return namesArray;

    }
}
module.exports = { Users };


    