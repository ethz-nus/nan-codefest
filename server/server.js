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
  activityId: String,
  startTime: Date,
  endTime: Date,
  loc: {
    longitude: Number,
    latitude: Number,
    formattedAdd: String
  },
  categories: [String],
  picUrl: string
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
  categories: [String]
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
  meetingTime: Date
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
      categories: newUser.categories
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

  /*
  ActivityGroup related Listeners
  */

  socket.on('addActivityGroup', function(newActivityGroup){
    newActivityGroup
  });
  socket.on('updateActivityGroup', function(newActivityGroup){

  });







  socket.on('updateQuiz', function (quizUpdate) {
    quiz
    //console.log(dbQuizUpdate);
    Quiz.update({ _id: quizUpdate._id }, dbQuizUpdate, function(err, numberAffected, raw) {
      if (err) return console.log(err);
      //console.log('Number of affected documents was %d', numberAffected);
      //console.log('Raw response from MongoDB: ', raw);
    });
    socket.broadcast.emit('updateQuiz', quizUpdate);
    console.log("Quiz Updated");
  });
  socket.on('initQuizState', function (quizState) {
    socket.broadcast.emit('initQuizState', {
      quizID : quizState.quizId,
      time : quizState.timeleft,
      timer : "paused",
      machineId: quizState.machineId,
      authorId : quizState.authorId
    });
    console.log("Quiz State written to " + quizState.machineId);
  });

  //DB functions
  socket.on('readCard', function (quizState) {
    // receive from client to get nodes to read card
    socket.broadcast.emit('readCard', {
      quizId : quizState.quizId,
      quesitonId : quizState.questionId,
      machineId : quizState.machineId,
      authorId : quizState.authorId
    });
    console.log("Card Read Requested at " + quizState.machineId );
  });
  socket.on('setCard', function (cardData) {
    // Card Data coming from Node
    /*
    Test Case
    ioSocketClientServer.emit('setCard', { quizId : 'blah3', questionId : 2, memberName : "noob", teamNumber : 1, answerNumber : 2});

    */
    // STEP 1: store to DB
    console.log(cardData);
    if (cardData == null || cardData == undefined) {return}
    var newAnswer = new Answer({
      timestamp : new Date().getTime(),
      quizId : cardData.quizId,
      questionId : cardData.questionId,
      memberName : cardData.memberName,
      teamNumber : cardData.teamNumber,
      answerNumber : cardData.answerNumber
    })
    newAnswer.save(function(err){
      if (err) return next(err);
    })
    socket.broadcast.emit('answerRead', {
      // STEP 2: To display which team answered, and how long it took them to answer
      //For Client
      quizId : cardData.quizId,
      questionId : cardData.questionId,
      teamNumber: cardData.teamNumber,
      name : cardData.memberName
    });
    console.log("read card to DB");
  });
  socket.on('readFromDB', function (quizState) {
    var answerMatrix = [];
    for (var teamNo = 0; teamNo < quizState.noOfTeams; teamNo++){
      Answer.find({
        quizId : quizState.quizId,
        questionId : quizState.questionId,
        teamNumber : teamNo
      }).sort({timestamp:-1}).limit(1).exec(function (err, answer){
        answerMatrix.push(answer);
      });
    }
    socket.broadcast.emit('dataFromDB', answerMatrix);
    console.log("Answers sent");
  });

  //Card Reader Functions
  socket.on('writeCard', function (cardData) {
    socket.broadcast.emit('writeCard', {
      memberName : cardData.memberName,
      team : cardData.team,
      answer : cardData.answer,
      machineId : cardData.machineId
    });
    console.log("Card write request sent");
  });



  //Other functions
  socket.on('backupCallback', function (callback) {
    console.log(callback);
    callback();
  });


  //Signal closure of socket
  socket.on('disconnect', function(){
    console.log("Socket closed");
  });
});
