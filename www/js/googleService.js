angular.module('google.service', ["googleApi"])
    .config(function(googleLoginProvider) {
        googleLoginProvider.configure({
            clientId: '892332260770-oq10pm310ql31ug3gd0fq23sq9slc658.apps.googleusercontent.com',
            scopes: ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/plus.login"]
        });
    })
    .factory('googleCtrl', ['$scope', 'googleLogin', 'googleCalendar', 'googlePlus', function ($scope, googleLogin, googleCalendar, googlePlus) {

        $scope.login = function () {
            googleLogin.login();
        };

        $scope.getUserEmail = function(){
            googleLogin.getClientEmail();
        };

        $scope.$on("googlePlus:loaded", function() {
          googlePlus.getCurrentUser().then(function(user) {
            $scope.currentUser = user;
          });
        });
        
        $scope.currentUser = googleLogin.currentUser;

        $scope.loadEvents = function() {
            this.calendarItems = googleCalendar.listEvents({calendarId: this.selectedCalendar.id});
        }

        $scope.loadCalendars = function() {
            $scope.calendars = googleCalendar.listCalendars();
        }

    }]);