// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('welcome', {
    url: "/welcome",
    templateUrl: "templates/welcome.html",
    controller: 'WelcomeCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: "/tab",
    abstract: true,
    templateUrl: "templates/tabs.html"
  })

  // Each tab has its own nav history stack:

  .state('tab.map', {
    url: '/map',
    views: {
      'tab-map': {
        templateUrl: 'templates/tab-map.html',
        controller: 'MapCtrl'
      }
    }
  })

  .state('tab.search', {
    url: '/search',
    views: {
      'tab-search': {
        templateUrl: 'templates/tab-search.html',
        controller: 'SearchCtrl'
      }
    }
  })

  .state('tab.search-result', {
    params: {
        date: null,
        location: null,
        category: null
    },
    views: {
      'tab-search': {
        templateUrl: 'templates/search-results.html',
        controller: 'SearchResultsCtrl'
      }
    }
  })

  .state('tab.result-detail', {
    url: '/results/:eventId',
    views: {
      'tab-search': {
        templateUrl: 'templates/event-detail.html',
        controller: 'EventDetailCtrl'
      }
    }
  })

  .state('tab.events', {
      url: '/events',
      views: {
        'tab-events': {
          templateUrl: 'templates/tab-events.html',
          controller: 'EventsCtrl'
        }
      }
    })

  .state('tab.event-detail', {
      url: '/events/:eventId',
      views: {
        'tab-events': {
          templateUrl: 'templates/event-detail.html',
          controller: 'EventDetailCtrl'
        }
      }
  })

  .state('tab.preference', {
    url: '/preference',
    views: {
      'tab-preference': {
        templateUrl: 'templates/tab-preference.html',
        controller: 'PreferenceCtrl'
      }
    }
  })

  .state('tab.time-to-location', {
    url: '/time-to-location',
    views: {
      'tab-time-to-location': {
        templateUrl: 'templates/time-to-location.html',
        controller: 'TTLCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  // if(window.localStorage['userid'])
    $urlRouterProvider.otherwise('/tab/search');
  // else
  //   $urlRouterProvider.otherwise('/welcome');

});
