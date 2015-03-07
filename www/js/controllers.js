angular.module('starter.controllers',['ionic'])

.controller('MapCtrl', function($scope, $ionicLoading, $compile) {
      function initialize() {
        console.log("load map");
        var myLatlng = new google.maps.LatLng(43.07493,-89.381388);

        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);

        //Marker + infowindow + angularjs compiled ng-click
        var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });

        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'Uluru (Ayers Rock)'
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });

        $scope.map = map;
      }
		$( document ).ready(function() {
			initialize();
		});
            // google.maps.event.addDomListener(window, 'load', initialize);

      $scope.centerOnMe = function() {
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
      };

      $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
	   };

     // $scope.centerOnMe();
})


.controller('EventsCtrl', function($scope, Events) {
  $scope.events = Events.all();
  $scope.remove = function(event) {
    Events.remove(event);
  };

  $scope.sortByTime = function(){
    $scope.events.sort(function(eventA, eventB){
      return eventA.time - eventB.time;
    })
  };

  $scope.sortByDistance = function(eventA, eventB){
    return eventA.distance - eventB.distance;
  }

  $scope.sortByTime();
})

.controller('EventDetailCtrl', function($scope, $stateParams, Events) {
  $scope.event = Events.get($stateParams.eventId);
})

.controller('PreferenceCtrl', function($scope) {
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

    $scope.getTimeToLocation = function(){
        //var dest = $stateParams.destination;
        var dest = "Seebach, Zurich"
        var time;
        //if($stateParams.departureTime){
        //  time = $stateParams.departureTime;
        //} else {
        time = new Date();
        //}
        //if($stateParams.transitPreferences === 'public'){
        TimeToLocation.getPublicTransportTime
          (lat, lon, dest, time, function(data, stat){
            $scope.result = data;
            $scope.$apply();
          });
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
