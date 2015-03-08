// var serverSocket = "getaway.jellykaya.com:3001";
var serverSocket = "getaway.jellykaya.com:3001";
angular.module('starter.services', [])
.factory('ioSocket', function($rootScope){
  var ioSocket;
  return {
    on: function (eventName, callback){
      if (!ioSocket){ var ioSocket = io.connect(serverSocket, {'sync disconnect on unload': true})}
      ioSocket.on(eventName, function(){
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(ioSocket, args);
        });
      });
    },
    emit: function (eventName, data, callback){
      if (!ioSocket){ var ioSocket = io.connect(serverSocket, {'sync disconnect on unload': true})}
      ioSocket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(ioSocket, args);
          }
        });
      });
    },
    open: function(){
      var ioSocket = io.connect(serverSocket, {'sync disconnect on unload': true});
    },
    close: function (){
      if(ioSocket) ioSocket.close();
    }
 };
})

.factory('Activities', ['$q', 'ioSocket', function($q, ioSocket) {

  ioSocket.on('connected', function(data){
    console.log("activities connected");
  });

  var resultEvents;
  var events;
  var observerCallbacks = [];

  var notifyObservers = function(){
    console.log("here");
      angular.forEach(observerCallbacks, function(callback){
          callback();
      });
  };

  var all = function(){
      if(events){ return defer.resolve(events);}
      var defer = $q.defer();
      ioSocket.open();
      ioSocket.emit('getActivities', {});
      ioSocket.on('receiveActivities', function(activities){
          ioSocket.close();
          events = [];
          for (var i=0; i<activities[0].length; i++){
              var tempEvt = activities[0][i];
              events.push({
                  title: tempEvt.activityId,
                  time: new Date(tempEvt.startTime),
                  pic: tempEvt.picUrl,
                  category: tempEvt.categories,
                  latitude: tempEvt.loc.longitude,
                  longitude: tempEvt.loc.latitude,
                  location: tempEvt.loc.formattedAdd,
                  id: tempEvt._id
              });
              resultEvents = events;

          }
          return defer.resolve(events);
      });
      //ioSocket.close();
      return defer.promise;
  }

  var get = function(eventId) {
      if(!events){
          promise = all()
          promise.then(function(data){
              get(eventId)
          });
      } else {
          for (var i = 0; i < events.length; i++) {
              if (events[i].id === eventId) {
                  return events[i];
              }
          }
          return null;
      }
  }

  var search = function(dateKey, locationKey, categoryKey){
      console.log(dateKey, locationKey, categoryKey);
      if(!events){
          promise = all();
          promise.then(function(data){
              console.log(this);
              search(dateKey, locationKey, categoryKey);
          });
      } else {
          resultEvents = events.filter( function(event){
              var dateTemp = null;
              if ( Object.prototype.toString.call(dateKey) === "[object Date]" ) {
                  // it is a date
                  if ( !isNaN( dateKey.getTime() ) ) {  // d.valueOf() could also work
                      // date is valid
                      dateTemp = Math.floor((Date.parse(dateKey) - Date.parse(event.time))/(1000*60*60*24));
                  }
              }
              if( dateTemp != null && Math.abs(dateTemp) > 2){
                  return false;
              }
              if ((locationKey != null) && (event.location.indexOf(locationKey)==-1) ){
                  return false;
              }
              if ((categoryKey != null) && (event.category.indexOf(categoryKey)==-1) ){
                  return false;
              }
              return true;
          });
          notifyObservers();
          return resultEvents;
      }
  }

  return {
    all: all,
    get: get,
    search: search,
    registerObserverCallback: function(callback){
      observerCallbacks.push(callback);
    },
    resultEvents: function(){

        return resultEvents;
    }
  }
}])

.factory('ActivityGroups', ['ioSocket', function(ioSocket) {
  ioSocket.on('connected', function(data){

  });

  return {
    getActivityGroups: function(id, transportMode){
      var activityQuery = {'id': id, 'transport': transportMode};
      ioSocket.emit('getActivityGroups', activityQuery);
      ioSocket.on('receiveActivityGroups', function(groups){
        ioSocket.close();
        return groups;
      })
    },
    updateActivityGroup: function(group){
      var defer = $q.defer();
      ioSocket.emit('updateActivityGroup', group);
      ioSocket.on('updateActivityGroupResult', function(result){
        ioSocket.close();
        return defer.resolve(result);
      })
      ioSocket.close();
      return defer.promise;
    }
  }
}])

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
      users:['Kin', 'Mark', 'Alex'],
      location:"Oerlikon",
      time: new Date("April 13, 2015 10:00:00"),
      contact:"9457227"
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
        users: ['Jane', 'Bryan', 'Tom']
      }
    ],

  },
  {
    id: 5,
    title: 'Museum visiting 2',
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
        users: ['Alex', 'Jane', 'Bryan']
      }
    ],

  }];

  var observerCallbacks = [];


  var resultEvents = events.filter(function(event){
    return true;
  });

  var attendingGroup = function(event,userId){
    /*for(var i = 0; i < event.groups.length; i++){
      var group = event.groups[i];
      if(group.users.indexOf(userId) > -1) {
        return group;
      }
  }*/
    return null;
  }

  var isAttending = function(event, userId){
    return attendingGroup(event, userId) != null;
  };

  var notifyObservers = function(){
    angular.forEach(observerCallbacks, function(callback){
      callback();
    });
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

    attendingGroup: function(event, userId){
      return attendingGroup(event, userId);
    },

    allAttending: function(userId){
      return events.filter(function(event){
        return isAttending(event, userId);
      })
    },

    resultEvents: function(){
      return resultEvents;
    },

    setResultEvent: function(event){
      resultEvents = [event];
      notifyObservers();
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
    search: function(dateKey, locationKey, categoryKey){
      console.log("search");
        resultEvents = events.filter( function(event){
            var dateTemp = null;
            if ( Object.prototype.toString.call(dateKey) === "[object Date]" ) {
                // it is a date
                if ( !isNaN( dateKey.getTime() ) ) {  // d.valueOf() could also work
                    // date is valid
                    dateTemp = Math.floor((Date.parse(dateKey) - Date.parse(event.time))/(1000*60*60*24));
                }
            }
            if( dateTemp != null && Math.abs(dateTemp) > 4){
                return false;
            }
            if ((locationKey != null) && event.location.toLowerCase().indexOf(locationKey.toLowerCase()) < 0 ){
                return false;
            }
            console.log(event.category.indexOf(categoryKey));
            if ((categoryKey != null) && event.category.indexOf(categoryKey) < 0 ){
                return false;
            }
            return true;
        });
        notifyObservers();
        return resultEvents;
    },
    registerObserverCallback: function(callback){
      observerCallbacks.push(callback);
    }
  };
})

.factory('LocationService', function(){

    return {
        getLocation: function(callback){
          if (navigator.geolocation){
            navigator.geolocation.getCurrentPosition(function(position){
              latitude = position.coords.latitude;
              longitude = position.coords.longitude;
              callback([false, latitude, longitude]);
                });
            } else {
                error = true;
                callback([true, 0, 0]);
            }
        }
    }

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
