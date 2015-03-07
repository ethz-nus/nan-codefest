angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats) {
  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  }
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('TTLCtrl', function($scope, TimeToLocation) {
    
  var lat = 0;
  var lon = 0;
  var error = false;   

  $scope.getLocation = function(){
    if (navigator.geolocation){
      navigator.geolocation.getCurrentPosition(function(position){
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      });
    } else {
      error = true;     
    }
  }

  $scope.getTimeToLocation = function($scope){
    //var dest = $stateParams.destination;
    var dest = "Seebach"
    var time;
    //if($stateParams.departureTime){
    //  time = $stateParams.departureTime;
    //} else {
      time = 'now';
    //}
    //if($stateParams.transitPreferences === 'public'){
      $scope.result = TimeToLocation.getPublicTransportTime(lat, lon, dest, time);
      $scope.$apply();
    //} else if ($stateParams.transitPreferences === 'driving'){
    //  return TimeToLocation.getDrivingTime(lat, lon, dest, time);
    //} else if ($stateParams.transitPreferences === 'uber'){
        //
    //} else {
        //
     // }
    //}
  }

  $scope.getLocation();
});
