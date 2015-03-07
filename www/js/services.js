var serverSocket = "getaway.jellykaya.com:3001";
angular.module('starter.services', [])
.factory('ioSocketSetup', function($rootScope){
  var ioSocket = io.connect(serverSocket);
  return {
    on: function (eventName, callback){
      ioSocket.on(eventName, function(){
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(ioSocket, args);
        });
      });
    },
    emit: function (eventName, data, callback){
      ioSocket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(ioSocket, args);
          }
        });
      });
    }
  };
})
.factory('Activities', ['$scope', '$rootScope', 'ioSocket', function($scope, $rootScope, ioSocket) {
  
  ioSocket.on('connected', function(data){

  });

  $scope.getActivities = function(){
    var defer = $q.defer();
    ioSocket.emit('getActivities', {});
    ioSocket.on('receiveActivities', function(activities){
      return defer.resolve(activities);
    });
    return defer.promise;
  };
  
}])
.factory('ActivityGroups', ['$scope', '$rootScope', 'ioSocket', function($scope, $rootScope, ioSocket) {
  ioSocket.on('connected', function(data){

  });

  $scope.getActivityGroups = function(id, transportMode){
    var activityQuery = {'id': id, 'transport': transportMode};
    ioSocket.emit('getActivityGroups', activityQuery);
    ioSocket.on('receiveActivityGroups', function(groups){
      return groups;
    })
  };

  $scope.updateActivityGroup = function(group){
    var defer = $q.defer();
    ioSocket.emit('updateActivityGroup', group);
    ioSocket.on('updateActivityGroupResult', function(result){
      return defer.resolve(result);
    })
    return defer.promise;
  };
}]);
// .factory('Chats', function() {
//   // Might use a resource here that returns a JSON array

//   // Some fake testing data
//   var chats = [{
//     id: 0,
//     name: 'Ben Sparrow',
//     lastText: 'You on your way?',
//     face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
//   }, {
//     id: 1,
//     name: 'Max Lynx',
//     lastText: 'Hey, it\'s me',
//     face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
//   }, {
//     id: 2,
//     name: 'Andrew Jostlin',
//     lastText: 'Did you get the ice cream?',
//     face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
//   }, {
//     id: 3,
//     name: 'Adam Bradleyson',
//     lastText: 'I should buy a boat',
//     face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
//   }, {
//     id: 4,
//     name: 'Perry Governor',
//     lastText: 'Look at my mukluks!',
//     face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
//   }];

//   return {
//     all: function() {
//       return chats;
//     },
//     remove: function(chat) {
//       chats.splice(chats.indexOf(chat), 1);
//     },
//     get: function(chatId) {
//       for (var i = 0; i < chats.length; i++) {
//         if (chats[i].id === parseInt(chatId)) {
//           return chats[i];
//         }
//       }
//       return null;
//     }
//   };
// });
