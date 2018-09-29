const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
var keys = require('../config/keys');
var User = require('../models/user');


const express = require('express');
var app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);



passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new GoogleStrategy({
    clientID: keys.ClientID,
    clientSecret: keys.clientSecret,
    callbackURL: '/auth/google/callback',
    proxy: true
},
    async function (accessToken, refreshToken, profile, done) {

        const existingUser = await User.findOne({ googleId: profile.id });

        if (existingUser) {
            return done(null, existingUser);
        } else {

            const newuser = await new User({ googleId: profile.id, name: profile.displayName }).save();
            done(null, newuser);
        }
    }
)
);



/*

  function (accessToken, refreshToken, profile, done) {
        console.log('profile:', profile.displayName);
      //  console.log('profile:', profile);

        User.findOne({ googleId: profile.id }).then(existingUser => {

            if (existingUser) {
                return done(null, existingUser);
            } else {

                var newUser = new User({
                    googleId: profile.id,
                    name: profile.displayName
                });
                newUser.save();

                done(null, newUser);
        }

        }).catch(e => {
            console.log(e);
        });
    }

*/