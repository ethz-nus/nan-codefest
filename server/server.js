/*
@author: yichao, naomileow, jishnumohan, jellyjellyrobot
*/

/*
Init Scripts
*/

var mongoose = require('mongoose');
var express = require('express');
var bcrypt = require('bcryptjs');

console.log("Script Initialized")

/*
Schema Init for Database Objects
*/


/*
Google Geocoding API
https://developers.google.com/maps/documentation/geocoding/#JSON
*/

var eventSchema = mongoose.Schema({
  eventId: String,
  startTime: Date,
  endTime: Date,
  loc: {
    locLong: Number,
    locLat: Number,
    locFormattedAdd: String
  },
  categories: [String]
});

var userSchema = mongoose.Schema({
  oauthId: Number,
  email: { type: String, unique: true },
  lastKnownLoc: {
    locLang: Number,
    locLat: Number
  },
  password: String,
  picture: String,
  categories: [String]
})

userSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  bcrypt.genSalt(10, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) return cb(err);
    cb(null, isMatch);
  });
};

var User = mongoose.model('User', userSchema);

var eventGroupSchema = mongoose.Schema({
  groupName: String,
  eventId: String,
  groupOwnerId: Number,
  groupMemberId: [Number],
  meetingLoc: {
    locLong: Number,
    locLat: Number,
    locFormattedAdd: String
  },
  meetingTime: Date
})


console.log("Schemas Initialized")
