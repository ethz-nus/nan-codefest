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

var mongoUri = 'mongodb://getaway.jellykaya.com/test'

/*
Schema Init for Database Objects
*/


/*
Google Geocoding API
https://developers.google.com/maps/documentation/geocoding/#JSON
*/

var activitySchema = mongoose.Schema({
  activityId: String,
  startTime: Date,
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

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", 'Origin, X-Requested-With, Content-Type, Accept');
    next();
};

app.use(allowCrossDomain);

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
    console.log('adding User ' + newUser);
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
    console.log('updating User' + newUser);
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
    console.log('adding Activity' + newActivity);
    newActivity = sanitiseInput(newActivity);
    new Activity({
      activityId: newActivity.activityId,
      startTime: newActivity.startTime,
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
    console.log('updating Activity' + newActivity);
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
    Activity.find({}).limit(1000).exec(function(err, activity){
      activities.push(activity);
    }).addCallback(function(err){
      console.log('sending Activities' + activities);
      socket.emit('receiveActivities', activities);
    });



  });

  /*
  ActivityGroup related Listeners
  */

  socket.on('addActivityGroup', function(newActivityGroup){
    console.log('adding ActivityGroup' + newActivityGroup);
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
    console.log('updating ActivityGroup' + newActivityGroup);
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
    }).addCallback(function(err){
      console.log('sending ActivityGroups' + activityGroups);
      socket.emit('receiveActivityGroups', activityGroups);
    });
  });

  //Signal closure of socket
  socket.on('disconnect', function(){
    console.log("Socket closed");
  });
});
