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
.factory('ActivityGroups', ['$scope', '$rootScope', 'ioSocket', function($scope, $rootScope, ioSocket)]) {
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
};
