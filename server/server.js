const express = require('express');
var app = express();
const server = require('http').createServer(app);
const passport = require('passport');
const exphbs = require('express-handlebars');
const session = require('express-session');
const fs = require('fs');

const io = require('socket.io')(server);
const { generateMessage, generateLocationMessage } = require('./message');
const moment = require('moment');
const path = require('path');
const publicPath = path.join(__dirname, '../public');
const { Users } = require('./users');
var user = new Users();
var keys = require('../config/keys');

// db setup
const mongoose = require('mongoose');
mongoose.connect(keys.mongoURI, { useNewUrlParser: true }).then((db) => {
    console.log('Mongodb connected');
}).catch((err) => {
    console.log('DB error:' + err);
});

server.listen(process.env.PORT || 3000);
app.use(express.static(publicPath));


// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

// Passport
app.use(passport.initialize());
app.use(passport.session());

require('../models/user');
require('../services/passport');
require('../routes/authRoutes')(app);


app.get('/', function (req, res) {
    res.render('index');
});


app.get('/chat', function (req, res) {
    res.render('chat', { user: req.user });
    console.log('chat user:', req.user);
});

app.get('/room', function (req, res) {
    res.render('room', { user: req.user });

});


// Makes the user object global in all views
app.get('*', function (req, res, next) {
       res.locals.user = req.user || null;
    next();
});

function isRealString(str) {
    return typeof str === 'string' && str.trim().length > 0;
}

io.on('connection', function (socket) {
    console.log('New user connected: ' + socket.id);


    socket.on('join', (params, callback) => {

        if (!isRealString(params.name) || !isRealString(params.room)) {
            return callback('Name and Room are required');
        }

        socket.join(params.room);
        user.removeUser(socket.id);
        user.addUser(socket.id, params.name, params.room);

        io.to(params.room).emit('updateUserList', user.getUserList(params.room));


        socket.emit('newMessage', generateMessage('Admin', 'Welcome to the Chat Room'));
        socket.broadcast.to(params.room).emit('newMessage', generateMessage('Admin', `${params.name} has joined.`));

        callback();
    });


    socket.on('disconnect', function () {
        var user_dis = user.removeUser(socket.id);
        console.log('disconnected:' + user_dis.id);
     
            user.removeUser(socket.id);
            io.to(user_dis.room).emit('updateUserList', user.getUserList(user_dis.room));
            io.to(user_dis.room).emit('newMessage', generateMessage('Admin', `${user_dis.name} has left.`));
        
    });


    socket.on('createLocationMessage', function (location) {
        var user_L = user.getUser(socket.id);
        //  console.log('LocationMessage:', location);
        var lat = location.latitude;
        var long = location.longtitude;
        var username = user_L.name;
        if (user_L) {
            io.to(user_L.room).emit('newLocationMessage', generateLocationMessage(username, lat, long));
        }
    });


    socket.on('createMessage', function (data) {
        var user_M = user.getUser(socket.id);
        var text = data.text;
        var username = user_M.name;
        
            
        if (user_M && isRealString(data.text)) {
            io.to(user_M.room).emit('newMessage', generateMessage(username, text));

        }
    });


    socket.on('upload-image', function (message) {
        var user_M = user.getUser(socket.id);
        var username = user_M.name;

        var writer = fs.createWriteStream(path.join(__dirname, '../public/tmp/' + message.name), {
            encoding: 'base64'
        });

        console.log('Uploading image...');

        writer.write(message.data);
        writer.end();

        writer.on('finish', function () {
            console.log('Image uploaded!');

            io.to(user_M.room).emit('image-uploaded', { 
                from:username,
                name: '/tmp/' + message.name,
                createdAt: moment(moment().valueOf()).format('h:mm a')
            });

        });

    });

});