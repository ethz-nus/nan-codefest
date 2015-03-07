angular.module('starter.services', [])

.factory('AccountManager',function(){
  return {
    saveUserId:function(id){
      window.localStorage['userid'] = id;
    },
    getUserId: function(){
      return window.localStorage['userid'] || 'Alex';
    }
  }
})

.factory('Events', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var events = [{
    id: 0,
    title: 'Music Festival',
    time: new Date("April 13, 2015 11:00:00"),
    pic: 'img/events/music.jpg',
    category: "Festival",
    url:"www.google.com",
    latitude: 47.367995,
    longitude: 8.539960,
    description: "dummy blahblahblah....",
    location:'Oerlikon',
    distance: 200,
    groups: [{
      owner:'Mark',
      transport:'private',
      users:['Kin', 'Mark']
    },
    {
      owner:'Martin',
      transport:'public',
      users:['Martin', 'James']
    }],

  }, {
    id: 1,
    title: 'Pig Show',
    time: new Date("April 13, 2015 11:00:00"),
    pic: 'img/events/art.jpg',
    category: "Art",
    url:"www.google.com",
    latitude: 47.366018,
    longitude: 8.518546,
    description: "dummy blahblahblah....",
    location:'ETH',
    distance: 5000,
    groups: [{
      owner: 'Kin',
      transport:'private',
      users:['Kin', 'Mark', 'Alex']
    }],

  }, {
    id: 2,
    title: 'Women Day',
    time: new Date("May 20, 2015 7:00:00"),
    pic: 'img/events/parade.jpg',
    category: "Festival",
    url:"www.google.com",
    latitude: 47.40063,
    longitude: 8.397846,
    description: "dummy blahblahblah....",
    location:'HB',
    distance: 1000,
    groups: [{
      owner: 'Kin',
      transport:'private',
      users:['Kin', 'Mark']
    },
    {
      owner: 'Martin',
      transport:'public',
      users:['Martin', 'James']
    }],

  }, {
    id: 3,
    title: 'Marathon',
    time: new Date("March 13, 2015 11:00:00"),
    pic: 'img/events/marathon.jpeg',
    category: "Sports",
    url:"www.google.com",
    latitude: 47.166143,
    longitude: 8.526764,
    description: "dummy blahblahblah....",
    location:'UZH',
    distance: 300,
    groups: [{
      owner: 'Mark',
      transport:'private',
      users:['Kin', 'Mark']
    },
    {
      owner: 'Bryan',
      transport:'public',
      users: ['Jane', 'Bryan']
    },
    {
      owner:'Charles',
      transport:'public',
      users: ['Charles', 'Ford']
    },
        {
      owner: 'Jane',
      transport:'private',
      users: ['Jane', 'Durant']
    }],

  }, {
    id: 4,
    title: 'Museum visiting',
    time: new Date("April 3, 2015 18:00:00"),
    pic: 'img/events/museum.jpg',
    category: "Museum",
    url:"www.google.com",
    latitude: 47.484497,
    longitude: 8.738251,
    description: "dummy blahblahblah....",
    location:'Mulach',
    distance: 500,
    groups: [
      {
        owner: 'Alice',
        transport:'public',
        users:['Alice', 'Bob', 'Kevin']}
      ,
      {
        owner: 'Bryan',
        transport:'public',
        users: ['Jane', 'Bryan']
      }
    ],

  },
  {
    id: 4,
    title: 'Museum visiting',
    time: new Date("April 3, 2015 18:00:00"),
    pic: 'img/events/museum.jpg',
    category: "Museum",
    url:"www.google.com",
    latitude: 47.484497,
    longitude: 8.738251,
    description: "dummy blahblahblah....",
    location:'Mulach',
    distance: 500,
    groups: [
      {
        owner: 'Alice',
        transport:'public',
        users:['Alice', 'Bob', 'Kevin']}
      ,
      {
        owner: 'Alex',
        transport:'public',
        users: ['Alex','Jane', 'Bryan']
      }
    ],

  }];

  var isAttending = function(event, userId){
    for(var i = 0; i < event.groups.length; i++){
      var group = event.groups[i];
      if(group.users.indexOf(userId) > -1) {
        return true;
      }
    }
    return false;
  };

  return {
    all: function() {
      return events;
    },

    remove: function(event) {
      events.splice(events.indexOf(event), 1);
    },

    get: function(eventId) {
      for (var i = 0; i < events.length; i++) {
        if (events[i].id === parseInt(eventId)) {
          return events[i];
        }
      }
      return null;
    },

    isAttending: function(event, userId){
      return isAttending(event, userId);
    },

    allAttending: function(userId){
      return events.filter(function(event){
        return isAttending(event, userId);
      })
    },

    quitEvent: function(targetEvent, userId){
      for(var i = 0; i < targetEvent.groups.length; i++){
        var group = targetEvent.groups[i];
        var index = group.users.indexOf(userId)
        if(index > -1) {
          group.users.splice(index, 1);
        }
      }
    },

    joinGroup: function(targetEvent, userId, group){
      group.users.push(userId);
    },

    quitGroup: function(targetEvent, userId, group){
      var index = group.users.indexOf(userId);
      if(index >= 0)
        group.users.splice(index, 1);
    },

    createGroup: function(targetEvent, userID, isPrivate){
      var transportType = isPrivate? 'private':'public';

      var newGroup = {
        owner: userID,
        transport: transportType,
        users: [userID]
      }
      targetEvent.groups.push(newGroup);
    },
    deleteGroup: function(targetEvent, userID){
      var newGroups = targetEvent.groups.filter(function(group){
        return group.owner != userID;
      });
      targetEvent.groups = newGroups;
    }

  };
})

.factory('TimeToLocation', function(){
    
    var distanceService = new google.maps.DistanceMatrixService();

    return {
        getPublicTransportTime:
          function (userLat, userLong, dest, arrivalTime, callback){
            distanceService.getDistanceMatrix(
              {
                origins: [userLat + ',' + userLong],
                destinations: [dest],
                travelMode: google.maps.TravelMode.TRANSIT,
                transitOptions: {arrivalTime: arrivalTime}
              }, function(data, stat){
                callback(data, stat);
              } 
            );
          },

        getDrivingTime:
          function (userLat, userLong, dest, arrivalTime, callback){
            distanceService.getDistanceMatrix(
              {
                origins: [userLat + ',' + userLong],
                destinations: [dest],
                travelMode: google.maps.TravelMode.DRIVING,
                transitOptions: {arrivalTime: arrivalTime}
              }, function(data, stat){
                callback(data, stat);
              }
            );
          }   
    }
});

