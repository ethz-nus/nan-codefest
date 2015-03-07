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

var eventSchema = mongoose.Schema({
  startTime: Number,
  endTime: ,
  eventId: String,
  location: Number,
  categories: [String],
  cost:
});

var userSchema = mongoose.Schema({
  oauthId: Number,
  email: { type: String, unique: true },
  lastKnownLocation: ,
  password: String,
  picture: String,
  categories: [String],

})

var eventGroupSchema = mongoose.Schema({
  
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



console.log("Schemas Initialized")
