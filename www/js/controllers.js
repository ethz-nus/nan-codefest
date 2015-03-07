angular.module('starter.controllers',['ionic'])

.controller('MapCtrl', function($scope, $ionicLoading, $ionicPopup, $compile, Events) {
      function initialize() {
        console.log("load map");
        var myLatlng = new google.maps.LatLng(47.3786569,8.5487367);

        var mapOptions = {
          center: myLatlng,
          zoom: 16,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById("map"),
            mapOptions);

        //Marker + infowindow + angularjs compiled ng-click
        /*var contentString = "<div><a ng-click='clickTest()'>Click me!</a></div>";
        var compiled = $compile(contentString)($scope);
        console.log(compiled);
        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });*/

        /*var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: 'Your Location'
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });*/

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

      $scope.clickMarker = function(id) {
	    evt = Events.all()[id];
        $ionicPopup.alert({
            title: evt.title,
            template: evt.category + ' Event At ' + evt.time
        });
      };

      $scope.addEventMarkers = function(){ 
        var events = Events.all();
        var bounds = new google.maps.LatLngBounds();
        for (key in events){
          var evt = events[key];
          var loc = new google.maps.LatLng(evt.latitude, evt.longitude);
          var marker = new google.maps.Marker({
            position: loc,
            map: $scope.map,
            title: evt.title,
            id: evt.id
          });
          google.maps.event.addListener(marker, 'click', function() {
            var contentString = "<div><a ng-click='clickMarker(" + this.id
            + ")'>Click to know more about " + this.title + "</a></div>";
            var compiled = $compile(contentString)($scope);
            var infowindow = new google.maps.InfoWindow({
                content: compiled[0]
            });
            infowindow.setContent(compiled[0]);
            infowindow.open($scope.map, this);
          });
          bounds.extend(loc);
        }
        $scope.map.fitBounds(bounds);
      }

    $scope.addEventMarkers();
    // $scope.centerOnMe();
})

.controller('SearchCtrl', function($scope, Events, AccountManager){
    $scope.userId = AccountManager.getUserId();
    $scope.events = Events.all();
    $scope.search = {
      date: new Date(),
      location: ''
    };

    $scope.search = function(){

      $scope.filteredEvents = $scope.events.filter( function(event){
          var dateTemp = null;
          if ( Object.prototype.toString.call($scope.search.date) === "[object Date]" ) {
            // it is a date
            if ( !isNaN( $scope.search.date.getTime() ) ) {  // d.valueOf() could also work
              // date is valid
               dateTemp = new Date(Date.parse($scope.search.date) - Date.parse(event.time));
            }
          }
          if( dateTemp != null && dateTemp.getDate() - 1 != 0)
            return false;
          else if (!isNaN($scope.location) && (!$scope.search.location.indexOf(event.location) ||  !event.location.indexOf($scope.search.location)) )
            return false;
          else if ( !isNaN($scope.category) && ($scope.search.catalog != event.catalog) )
            return false;
          else return true;
        });
      window.location.href = "#/tab/results";
      console.log($scope.filteredEvents);
    }

    $scope.isAttending = function(event){
      return Events.isAttending(event, $scope.userId);
    }

    $scope.deregister = function(event){
      Events.quitEvent(event, $scope.userId);
    }

})

.controller('ResultDetailCtrl', function($scope, $stateParams, Events, AccountManager) {
  $scope.event = Events.get($stateParams.eventId);
  $scope.selectedGroupIndex;
  $scope.userId = AccountManager.getUserId();
  $scope.registeredGroup;

  $scope.print = function(array){
    var str = ' ';
    array.forEach(function(element, index, array){
      str += element;
      if(index != array.length - 1){
        str+=", "
      }
    });
    return str;
  }

  $scope.register = function(index, group){
    if($scope.registeredGroup != null ){
      $scope.deregister($scope.registeredGroup);
    }
    $scope.selectedGroupIndex = index;
    Events.joinGroup($scope.event, $scope.userId, group);
    $scope.registeredGroup = group;
  }

  $scope.deregister = function(group){
    $scope.selectedGroupIndex = -1;
    Events.quitGroup($scope.event, $scope.userId, group);
  }


  $scope.createGroup = function(isPrivate){
    Events.createGroup($scope.event, $scope.userId, isPrivate);
    $scope.disableNewGroup();
  }

  $scope.deleteGroup = function(){
    Events.deleteGroup($scope.event, $scope.userId);
    $scope.enableNewGroup();
  }

  $scope.goSolo = function(){
    $scope.disableNewGroup();
  }

  $scope.disableNewGroup = function(){
    $scope.deregister($scope.registeredGroup);
    $scope.selectedGroupIndex = -1;
    $("#create-private-btn").attr("disabled",true);
    $("#create-public-btn").attr("disabled",true);
    $("#solo-btn").attr("disabled",true);
  }

  $scope.enableNewGroup = function(){
    $("#create-private-btn").attr("disabled",false);
    $("#create-public-btn").attr("disabled",false);
    $("#solo-btn").attr("disabled",false);
  }
})

.controller('EventsCtrl', function($scope, Events,  AccountManager) {
  $scope.userId = AccountManager.getUserId();
  $scope.events = Events.allAttending($scope.userId);

  $scope.remove = function(event) {
    AttendingEvents.remove(event);
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
