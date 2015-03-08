/*
@author: yichao, naomileow, jishnumohan, jellyjellyrobot
*/

/*
Init Scripts
*/

var mongoose = require('mongoose');
var express = require('express');
var nodemailer = require('nodemailer');
var geolib = require('geolib');

console.log("Script Initialized")

var mongoUri = 'mongodb://getaway.jellykaya.com/test,mongodb://localhost/test'

/*
Schema Init for Database Objects
*/


/*
Google Geocoding API
https://developers.google.com/maps/documentation/geocoding/#JSON
*/

var activitySchema = mongoose.Schema({
  activityName: String,
  activityId: Number,
  startTime: Date,
  endTime: Date,
  loc: {
    longitude: Number,
    latitude: Number,
    formattedAdd: String
  },
  categories: [String],
  picUrl: String
});

var Activity = mongoose.model('Activity', activitySchema);

var userSchema = mongoose.Schema({
  oauthId: Number,
  email: { type: String, unique: true },
  lastKnownLoc: {
    longitude: Number,
    latitude: Number
  },
  picture: String,
  categories: [String],
  phoneNumber: String
})

var User = mongoose.model('User', userSchema);

var activityGroupSchema = mongoose.Schema({
  groupName: String,
  activityId: String,
  groupOwnerId: Number,
  groupMemberId: [Number],
  meetingLoc: {
    longitude: Number,
    latitude: Number,
    formattedAdd: String
  },
  meetingTime: Date,
  transport: String
})

var ActivityGroup = mongoose.model('ActivityGroup', activityGroupSchema);

console.log("Schemas Initialized");

mongoose.connect(mongoUri, function(err){
  if (err) {
    console.log("Cannot connect to getaway.jellykaya.com!")
    console.log(err);
  }else{
    console.log("Connected to getaway.jellykaya.com")
  }
});


/*
Init Socket.io
*/

var app = express();
var ioServer = require('http').Server(app)
var io = require('socket.io')(ioServer);

ioServer.listen(3001, function(){
  console.log("ioServer running at port 3001!")
});



io.on('connection', function (socket) {

  console.log("Socket intialized");

  /*
  Sanitizer Required because Socket.io sucks
  */

  var sanitizeInput = function(oldObject){
    var newObject = {}
    for(var key in oldObject) {
      if (key != '__v' && key != '$resolved' && key != '$promise'){
        newObject[key] = oldObject[key];
      }
    }
    return newObject;
  }

  socket.emit('connected', {});

  /*
  User related listeners
  */

  socket.on('addUser', function (newUser){
    newUser = sanitizeInput(newUser);
    new User({
      oauthId: newUser.oauthId,
      email: newUser.email,
      lastKnownLoc: {
        longitude: newUser.lastKnownLoc.longitude,
        latitude: newUser.lastKnownLoc.latitude
      },
      picture: newUser.picture,
      categories: newUser.categories,
      phoneNumber: newUser.phoneNumber
    }).save(function(err){
      if (err) {
        console.log("Error in saving user");
        console.log(err);
      };
    });
  });
  socket.on('updateUser', function (newUser){
    newUser = sanitizeInput(newUser);
    User.update({ email: newUser.email }, newUser,
      function(err, elementsChanged, rawMongoOutput){
        if (err) {
          console.log("Error in saving user");
          console.log(err);
        };
    });
  });

  /*
  Activity related Listeners
  */

  socket.on('addActivity', function(newActivity){
    newActivity = sanitiseInput(newActivity);
    new Activity({
      activityId: newActivity.activityId,
      startTime: newActivity.startTime,
      endTime: newActivity.endTime,
      loc: {
        longitude: newActivity.loc.longitude,
        latitude: newActivity.loc.latitude,
        formattedAdd: newActivity.loc.latitude
      },
      categories: newActivity.categories,
      picUrl: newActivity.picUrl
    }).save(function(err){
      if (err) {
        console.log("Error in saving activity");
        console.log(err);
      };
    });
    socket.broadcast.emit('addActivity', newActivity);
  });
  socket.on('updateActivity', function(newActivity){
    newActivity = sanitiseInput(newActivity);
    Activity.update({ activityId: newActivity.activityId }, newActivity,
      function(err, elementsChanged, rawMongoOutput){
        if (err) {
          console.log("Error in saving activity");
          console.log(err);
        }
    });
    socket.broadcast.emit('updateActivity', newActivity);
  });
  socket.on('getActivities', function(){
    var activities = [];
    Activity.find({}).exec(function(err, activity){
      activities.push(activity);
    });
    socket.emit('receiveActivities', activities);
  });

  /*
  ActivityGroup related Listeners
  */

  socket.on('addActivityGroup', function(newActivityGroup){
    newActivityGroup = sanitiseInput(newActivityGroup);
    new ActivityGroup({
      groupName: newActivityGroup.groupName,
      activityId: newActivityGroup.activityId,
      groupOwnerId: newActivityGroup.groupOwnerId,
      groupMemberId: newActivityGroup.groupMemberId,
      meetingLoc: {
        longitude: newActivityGroup.meetingLoc.longitude,
        latitude: newActivityGroup.meetingLoc.latitude,
        formattedAdd: newActivityGroup.meetingLoc.formattedAdd
      },
      meetingTime: newActivityGroup.meetingTime,
      transport: newActivityGroup.transport
    }).save(function(err){
      if (err) {
        console.log("Error in saving activity group");
        console.log(err);
      };
    });
    socket.broadcast.emit('addActivityGroup', newActivity);
  });
  socket.on('updateActivityGroup', function(newActivityGroup){
    newActivityGroup = sanitiseInput(newActivityGroup);
    ActivityGroup.update({ groupName: newActivityGroup.groupName },
      newActivityGroup, function(err, elementsChanged, rawMongoOutput){
        if (err) {
          console.log("Error in saving activity group");
          console.log(err);
        }
      });
    socket.broadcast.emit('updateActivityGroup', newActivity);
  });
  socket.on('getActivityGroup', function(query){
    var activityGroups = [];
    ActivityGroup.find({
      activityId: query.activityId,
      transport: query.transport
    }).exec(function(err, activityGroup){
      activityGroups.push(activityGroup);
    });
    socket.emit('receiveActivityGroups', activityGroups);
  });

  //Signal closure of socket
  socket.on('disconnect', function(){
    console.log("Socket closed");
  });
});
