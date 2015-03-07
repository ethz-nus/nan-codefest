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
      
.controller('SearchCtrl', function($scope, Events){
    $scope.events = Events.all();
    $scope.search = {
      date: new Date(),
      location: ''
    };

    $scope.search = function(){

      console.log("search");
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

})

.controller('ResultDetailCtrl', function($scope, $stateParams, Events) {
  $scope.event = Events.get($stateParams.eventId);
  $scope.selectedGroupIndex;

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

  $scope.register = function(groupID){
    $scope.selectedGroupIndex = groupID;
  }

  $scope.deregister = function(groupID){
    console.log("deregister");
    $scope.selectedGroupIndex = -1;
  }


})

.controller('EventsCtrl', function($scope, AttendingEvents) {
  $scope.events = AttendingEvents.all();

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
});
