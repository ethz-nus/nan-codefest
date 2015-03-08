angular.module('googleApi', ['starter.services'])
	.value('version', '0.1')

    .service("googleApiBuilder", function($q) {
        this.loadClientCallbacks = [];

        this.build = function(requestBuilder, responseTransformer) {
            return function(args) {
                var deferred = $q.defer();
                var response;
                request = requestBuilder(args);
                request.execute(function(resp, raw) {
                    if(resp.error) {
                        deferred.reject(resp.error);
                    } else {
                        response = responseTransformer ? responseTransformer(resp) : resp;
                        deferred.resolve(response);
                    }

                });
                return deferred.promise;

            }
        };

        this.afterClientLoaded = function(callback) {
            this.loadClientCallbacks.push(callback);
        };

        this.runClientLoadedCallbacks = function() {
            for(var i=0; i < this.loadClientCallbacks.length; i++) {
                this.loadClientCallbacks[i]();
            }
        };
    })

    .provider('googleLogin', function() {

        this.configure = function(conf) {
            this.config = conf;
        };

        this.$get = function ($q, googleApiBuilder, ioSocket, LocationService, $rootScope) {
            var config = this.config;
            var deferred = $q.defer();
            return {
                login: function () {
                    gapi.auth.authorize({ client_id: config.clientId, scope: config.scopes, immediate: false}, this.handleAuthResult);

                    return deferred.promise;
                },

                handleClientLoad: function () {
                    gapi.auth.init(function () { });
                    window.setTimeout(checkAuth, 1);
                },

                checkAuth: function() {
                    gapi.auth.authorize({ client_id: config.clientId, scope: config.scopes, immediate: true }, this.handleAuthResult );
                },

                getAndSendClientEmail: function(){
                    var defer = $q.defer();
                    console.log(defer);
										console.log("ahdjakhd");
                    gapi.client.load('oauth2', 'v2', function() {
                        gapi.client.oauth2.userinfo.get().execute(
                            function(resp) {
															console.log("BNSBDKALSJNDKDJH")
                                var number = Math.floor(Math.random() * 800000000);
                                ioSocket.on('connected', function(data){
                                    console.log("connected");
                                    LocationService.getLocation(function(loc){
                                        if(!loc[0]){
                                                ioSocket.emit('addUser',
                                                            {
                                                                email: resp.email,
                                                                lastKnownLoc: {
                                                                longitude: loc[1],
                                                                latitude: loc[2]
                                                                },
                                                                phoneNumer: number
                                                            })

                                            }else{
                                                ioSocket.emit('addUser', {
                                                                email: resp.email,
                                                                phoneNumer: number
                                                            })
                                            }


                                    });

                                });
                                console.log(resp.email);
                                defer.resolve(resp.email);
                            });
                    })
                    return defer;
                },

                getClientInfo: function(){
                    gapi.client.load('plus', 'v1', function() {
                    gapi.client.plus.people.get( {'userId' : 'me'} ).execute(
                        function(resp) {
                            // Shows other profile information
                            console.log(resp);
                            deferred.resolve(resp);
                        })
                    });
                },

                handleAuthResult: function(authResult) {
                    if (authResult && !authResult.error) {
                        var data = {};
                        $rootScope.$broadcast("google:authenticated", authResult);
                        googleApiBuilder.runClientLoadedCallbacks();

                        deferred.resolve(data);
                    } else {
                        deferred.reject(authResult.error);
                    }
                },
            }
        };


    })

    .service("googleCalendar", function(googleApiBuilder, $rootScope) {

        var self = this;
        var itemExtractor = function(resp) { return resp.items; };

        googleApiBuilder.afterClientLoaded(function() {
            gapi.client.load('calendar', 'v3', function() {

                self.listEvents = googleApiBuilder.build(gapi.client.calendar.events.list, itemExtractor);
                self.listCalendars = googleApiBuilder.build(gapi.client.calendar.calendarList.list, itemExtractor);
                self.createEvent = googleApiBuilder.build(gapi.client.calendar.events.insert);

                $rootScope.$broadcast("googleCalendar:loaded")
            });

        });

    })

	.service("googlePlus", function(googleApiBuilder, $rootScope) {

			var self = this;
			var itemExtractor = function(resp) { return resp.items; };

			googleApiBuilder.afterClientLoaded(function() {
					gapi.client.load('plus', 'v1', function() {
						self.getPeople = googleApiBuilder.build(gapi.client.plus.people.get);
						self.getCurrentUser = function() {
							return self.getPeople({userId: "me"});
						}
						$rootScope.$broadcast("googlePlus:loaded")
					});

			});

	})
