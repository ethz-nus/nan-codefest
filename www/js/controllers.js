angular.module('starter.controllers',['ionic', 'googleApi'])
.config(function(googleLoginProvider) {
        googleLoginProvider.configure({
            clientId: '892332260770-n6l62ol28do1a44f5jkstg5vbnfmsbbt.apps.googleusercontent.com',
            scopes: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/plus.login"]
        });
    })
.controller('MapCtrl', function($scope, $ionicLoading, $ionicPopup, $compile, Activities, Events) {
      $("ion-nav-bar").show();

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
          var loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          var pinColor = "387ef5";
          var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
            new google.maps.Size(21, 34),
            new google.maps.Point(0,0),
            new google.maps.Point(10, 34));
          var marker = new google.maps.Marker({
            position: loc,
            map: $scope.map,
            icon: pinImage
          });
          $scope.markers.push(marker);

        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
      };

      $scope.clickMarker = function(id) {
        evt = Activities.get(id);
        $ionicPopup.alert({
            title: evt.title,
            template: evt.category + ' Event At ' + evt.time
        });
      };

      $scope.markers = [];


      // Sets the map on all markers in the array.
      $scope.setAllMap = function(map) {
        for (var i = 0; i < $scope.markers.length; i++) {
          $scope.markers[i].setMap(map);
        }
      };

      $scope.clearMarkers = function(){
        $scope.setAllMap(null);
      };

      var events;

      $scope.addEventMarkers = function(){
        events = Activities.resultEvents();
        if(!events){
            promise = Activities.all();
            promise.then(function(data){
                console.log('all');
                events = data;
                doMapProcessing();
            });
        } else {
            doMapProcessing();
        }
      };

    function doMapProcessing(){
      var bounds = new google.maps.LatLngBounds();
      for (key in events){
          var evt = events[key];
          console.log(evt);
          var loc = new google.maps.LatLng(evt.latitude, evt.longitude);
          var marker = new google.maps.Marker({
              position: loc,
              map: $scope.map,
              title: evt.title,
              id: evt.id
          });

          $scope.markers.push(marker);

          google.maps.event.addListener(marker, 'click', function() {
              var contentString = "<div><a ng-click='clickMarker(\"" + this.id
              + "\")'>Click to know more about " + this.title + "</a></div>";
              var compiled = $compile(contentString)($scope);
              var infowindow = new google.maps.InfoWindow({
                  content: compiled[0]
              });
              infowindow.setContent(compiled[0]);
              infowindow.open($scope.map, this);
          });
          bounds.extend(loc);
      }
      var listener1 = google.maps.event.addListener($scope.map, "idle", function() {
          $scope.map.fitBounds(bounds);
          google.maps.event.removeListener(listener1);
      });
      var listener2 = google.maps.event.addListener($scope.map, "idle", function() {
          if ($scope.map.getZoom() > 16) $scope.map.setZoom(16);
          google.maps.event.removeListener(listener2);
      });
    }

      $scope.setGeoMarker = function(){
        var pinColor = "387ef5";
        var pinImage = new google.maps.MarkerImage("http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + pinColor,
          new google.maps.Size(21, 34),
          new google.maps.Point(0,0),
          new google.maps.Point(10, 34));
          $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });
        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.loading.hide();
          var loc = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          var marker = new google.maps.Marker({
            position: loc,
            map: $scope.map,
            icon: pinImage
          });
          $scope.markers.push(marker);

        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
      }

    $scope.clearMarkers();
    $scope.addEventMarkers();

    Activities.registerObserverCallback(function(){
      $scope.clearMarkers();
      $scope.addEventMarkers();
    });
    // $scope.centerOnMe();
})

.controller('SearchCtrl', function($scope, $state, Activities, Events){

    // $scope.userId = AccountManager.getUserId();

    $scope.search ={
      date: null,
      location: null
    }

    $scope.searchEvents = function(category){
        $state.go('tab.search-result',{
            date: $scope.search.date,
            location: $scope.search.location,
            category: category
        });
    };

    // var loc1 = $scope.events[0].latitude+","+$scope.events[0].longitude;
    // var loc2 = $scope.events[1].latitude+","+$scope.events[1].longitude;

    // $.ajax({
    //     url: 'https://maps.googleapis.com/maps/api/distancematrix/json?origins='+loc1+'&destinations='+loc2+'&mode=bicycling&language=fr-FR&key=',
    //     type: 'GET',
    //     success: function(data) {
    //       console.log(data);          
    //     },
    //     error: function(data) {
    //       console.log(data);
    //     }
    //   });

    


})


.controller('SearchResultsCtrl', function($scope, $stateParams, Activities, Events) {

    $scope.events = Activities.search($stateParams.date, $stateParams.location, $stateParams.category);

    $scope.isAttending = function(event){
      return Events.isAttending(event, $scope.userId);
    }

    $scope.deregister = function(event){
      Events.quitEvent(event, $scope.userId);
    }

})


.controller('EventsCtrl', function($scope, Events,  AccountManager) {
  console.log("event");
  $scope.userId = AccountManager.getUserId();
  $scope.events = Events.allAttending($scope.userId);

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
  };

  $scope.deregister = function(event){
    Events.quitEvent(event, $scope.userId);
    $scope.events = Events.allAttending($scope.userId);
};

  $scope.sortByTime();
})

.controller('EventDetailCtrl', function($scope, $stateParams, Events, AccountManager) {
  $scope.event = Activities.get($stateParams.eventId);
  $scope.userId = AccountManager.getUserId();
  $scope.registeredGroup = Events.attendingGroup($scope.event, $scope.userId);
  $scope.selectedGroupIndex = $scope.registeredGroup? $scope.event.groups.indexOf($scope.registeredGroup) : -1;

  Events.setResultEvent($scope.event);

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

  // $scope.showRouting = function(){
  //    $rootScope.$broadcast('markRoute');
  // }
})

.controller('PreferenceCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('TTLCtrl', function($scope, ioSocket, Activities, LocationService, TimeToLocation) {

    var lat, lon, error;

    ioSocket.open();

    $scope.getActivities = function(){
        var promise = Activities.getActivities();
        promise.then(function(data){
            console.log(data);
        })
    }

    window.onbeforeunload = function(){
        ioSocket.close();
    }

    $scope.$on('$destroy', function() {
        delete window.onbeforeunload;
    });

    $scope.getLocation = function(){
      LocationService.getLocation(function(result){
        error = result[0];
        lat = result[1];
        lon = result[2];
      });
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
})


.controller('WelcomeCtrl', ['$scope', 'googleLogin', 'ioSocket', function($scope, googleLogin, ioSocket){
  $("ion-nav-bar").hide();
  $scope.login = function(){

    var result = googleLogin.login();
      result.then(function(val){
         googleLogin.getAndSendClientEmail();
        window.location.href = "/#/tab/search";
      });

  };
}]);
