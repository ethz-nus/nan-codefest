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
      transport:'private',
      users:['Kin', 'Mark']
    },
    {
      transport:'public',
      users:['Martin', 'James']
    }]
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
      transport:'private',
      users:['Kin', 'Mark']
    }]
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
      transport:'private',
      users:['Kin', 'Mark']
    },
    {
      transport:'public',
      users:['Martin', 'James']
    }]
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
      transport:'private',
      users:['Kin', 'Mark']
    },
    {
      transport:'public',
      users: ['Jane', 'Bryan']
    },
    {
      transport:'public',
      users: ['Charles', 'Ford']
    },
        {
      transport:'private',
      users: ['Jane', 'Durant']
    }]
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
    ]

  }];


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
          return events[i];s
        }
      }
      return null;
    },
    createGroup: function(targetEvent, userID, isPrivate){

      var transportType = isPrivate? 'private':'public';

      var newGroup = {
        owner: userID,
        transport: transportType,
        users: [userID]
      }
      console.log(newGroup);
      targetEvent.groups.push(newGroup);
    }

  };
})

.factory('AttendingEvents', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var events = [{
    id: 0,
    title: 'Music Festival',
    time: new Date("April 13, 2015 11:00:00"),
    pic: 'img/events/music.jpg',
    category: "Festival",
    url:"www.google.com",
    description: "dummy blahblahblah....",
    location:'Oerlikon',
    distance: 200
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
    distance: 5000
  }, {
    id: 2,
    title: 'Women Day',
    time: new Date("May 20, 2015 7:00:00"),
    pic: 'img/events/parade.jpg',
    category: "Festival",
    url:"www.google.com",
    latitude: 47.400063,
    longitude: 8.397846,
    description: "dummy blahblahblah....",
    location:'HB',
    distance: 1000
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
    distance: 300
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
    distance: 500
  }];


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

