var app = angular.module('trackamon', ['ngRoute', 'angular-google-adsense']);

app.controller('ParentController', function($scope) {

});

app.controller('HomeController', function($scope) {
	var circles = [],
		appearancePoints = [],
		disappearancePoints = [],
		appearanceOrDisappearance = [],
		squares = [],
		rectangles = [],
		tracking = false,
		accuracy = 10,
		range = 200,
		distanceForAppearance = (range + accuracy)/accuracy,
		distanceForDisappearance = (range - accuracy)/accuracy,
		clearButton = $('<button class="border-danger btn btn-lg clear-button map-button" id="clearButton"><span class="text-danger"><i class="fa fa-times-circle" aria-hidden="true"></i> Clear</span></button>'),
		sightingButton = $('<button class="border-success btn btn-lg sighting-button map-button" id="sightingButton"><span class="text-success"><i class="fa fa-crosshairs" aria-hidden="true"></i> Sighting</span></button>'),
		disappearedButton = $('<button class="border-warning btn btn-lg disappeared-button map-button" id="disappearedButton"><span class="text-warning"><i class="fa fa-ban" aria-hidden="true"></i> Disappeared</span></button>'),
		helpButton = $('<button class="border btn btn-lg help-button map-button" id="helpButton"><img src="img/trackemall.png" width="25"> Track \'Em All</button>'),
		refreshButton = $('<button class="btn btn-lg refresh-button map-button" id="refreshButton"><i class="fa fa-refresh" aria-hidden="true"></i> Re-Draw</button>'),
		undoButton = $('<button class="btn btn-lg undo-button map-button" id="undoButton"><i class="fa fa-undo" aria-hidden="true"></i> Undo</button>'),
		currentLocationButton = $('<button class="border-primary btn btn-lg current-location-button map-button" id="currentLocationButton"><span class="text-primary"><i class="fa fa-location-arrow" aria-hidden="true"></i></span></button>'),
		currentLocationMarker, 
		map, 
		latitudeDifference,	
		longitudeDifference, 
		maxLatitudeNorth, 
		maxLatitudeSouth, 
		maxLongitudeEast,
		maxLongitudeWest;

	$scope.init = function(){
		findCurrentLocation(loadInitialMap);

		$( window ).on( "orientationchange", function( event ) {
			$scope.refresh();
		});
	};

	$scope.addTrackingPoint = function(){
		showLoading();
		findCurrentLocation(addTrackingPointAtPosition);
	};

	$scope.addDisappearedPoint = function(){
		showLoading();
		findCurrentLocation(addDisappearedPointAtPosition);
	};

	$scope.clearTracking = function(){
		_.each(rectangles, function(rectangle){
			rectangle.setMap(null);
		});

		squares = [];
		rectangles = [];
		tracking = false;
		appearancePoints = [];
		disappearancePoints = [];
		appearanceOrDisappearance = [];
		removeLocalStorage();

		map.controls[google.maps.ControlPosition.TOP_RIGHT].pop();
		//map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].pop();
		//map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].pop();
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].pop();
	};

	$scope.openHelp = function(){
		$("#help-modal").modal();
	};

	$scope.refresh = function(){
		showLoading();
		findCurrentLocation(refreshFunction);
	};

	$scope.undo = function(){
		var appearance = appearanceOrDisappearance.pop(),
			undoSquare;
		if(appearance){
			undoSquare = appearancePoints.pop();
		}else{
			undoSquare = disappearancePoints.pop();
		}
		console.log("TODO");
	};

	$scope.currentLocation = function(){
		$scope.refresh();
	};

	removeLocalStorage = function(){
		localStorage.removeItem("trackEmAll");
		localStorage.removeItem("trackEmAllLatitudeDifference");
		localStorage.removeItem("trackEmAllLongitudeDifference");
		localStorage.removeItem("trackEmAllTime");
	};

	refreshFunction = function(coordinate){
		_.each(rectangles, function(rectangle){
			rectangle.setMap(null);
		});

		_.each(squares, function(square, index){
			if(square.active){
				rectangles[index].setMap(map);
			}
		});
		centerOnCurrentLocation(coordinate);
		hideLoading();
	};

	track = function(coordinate, isAppearance){
		_.each(squares, function(square, index){
			if(square.active){
				var latitudeLength = (square.centerLatitude - coordinate.lat)/latitudeDifference,
					longitudeLength = (square.centerLongitude - coordinate.lng)/longitudeDifference,
					distanceToCenter = Math.sqrt((latitudeLength*latitudeLength) + (longitudeLength*longitudeLength));

				if((isAppearance && distanceToCenter > distanceForAppearance)
					|| (!isAppearance && distanceToCenter < distanceForDisappearance)){
					rectangles[index].setMap(null);
					square.active = false;
				} else {
					rectangles[index].setMap(map);
				}
			}
		});

		localStorage.setItem("trackEmAll", JSON.stringify(squares));
		localStorage.setItem("trackEmAllTime", moment().format('MMMM Do YYYY, h:mm:ss a'));
	};

	buildStartingSquares = function(coordinate){
		latitudeDifference = coordinate.lat - geolib.computeDestinationPoint(coordinate, accuracy, 0).latitude;
		longitudeDifference = coordinate.lng - geolib.computeDestinationPoint(coordinate, accuracy, 90).longitude;
		maxLatitudeNorth = geolib.computeDestinationPoint(coordinate, range, 0).latitude;
		maxLatitudeSouth = geolib.computeDestinationPoint(coordinate, range, 180).latitude;
		maxLongitudeEast = geolib.computeDestinationPoint(coordinate, range, 90).longitude;
		maxLongitudeWest = geolib.computeDestinationPoint(coordinate, range, 270).longitude;

		if(latitudeDifference < 0){
			latitudeDifference *= -1;
		}

		if(longitudeDifference < 0){
			longitudeDifference *= -1;
		}

		localStorage.setItem("trackEmAllLatitudeDifference", latitudeDifference);
		localStorage.setItem("trackEmAllLongitudeDifference", longitudeDifference);

		drawSquaresHorizontal(maxLongitudeWest, maxLongitudeEast, longitudeDifference, maxLatitudeSouth, maxLatitudeNorth, latitudeDifference);
	};

	drawSquaresHorizontal = function(startinglongitude, endingLongitude, longitudeDifference, startingLatitude, maxLatitudeNorth, latitudeDifference){
		var maxLatitude = startingLatitude + latitudeDifference

		while(startinglongitude < endingLongitude){
			var nextLongitude = startinglongitude + longitudeDifference;
			drawSquare(maxLatitude, startingLatitude, nextLongitude, startinglongitude);
			drawSquaresVertical(maxLatitude, maxLatitudeNorth, latitudeDifference, startinglongitude, longitudeDifference);
			startinglongitude = nextLongitude;
		}
	};

	drawSquaresVertical = function(startingLatitude, endingLatitude, latitudeDifference, startinglongitude, longitudeDifference){
		var maxLongitude = startinglongitude + longitudeDifference

		while(startingLatitude < endingLatitude){
			var nextLatitude = startingLatitude + latitudeDifference;
			drawSquare(nextLatitude, startingLatitude, maxLongitude, startinglongitude);
			startingLatitude = nextLatitude;
		}
	};

	drawSquare = function(north, south, east, west){

		createRectangle(north, south, east, west, map);

		squares.push({
			active: true,
			north: north,
			south: south,
			east: east,
			west: west,
			centerLatitude: (north+south)/2,
			centerLongitude: (east+west)/2
		});	
	};

	createRectangle = function(north, south, east, west, activeMap){

		rectangles.push(new google.maps.Rectangle({
			strokeWeight: 0,
			fillColor: '#00FF00',
			fillOpacity: 0.35,
			map: activeMap,
			bounds: {
				north: north,
				south: south,
				east: east,
				west: west
			}
		}));
	};

	findCurrentLocation = function(callback){
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(callback);
		} else {
			$scope.message = "Geolocation is not supported by this browser.";
		}
	};

	centerOnCurrentLocation = function(position){
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude};
		currentLocationMarker.setPosition(coordinate);
		map.setCenter(coordinate);		
	};

	loadInitialMap = function(position){
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude};

		map = new google.maps.Map(document.getElementById('map'), {
			center: coordinate,
			mapTypeId: 'roadmap',
			zoom: 17,
			streetViewControl: false,
			mapTypeControl: false,
			zoomControl:false,
			styles: mapStyle
		});

		var icon = {
			url: 'img/currentLocation.svg', // url
			scaledSize: new google.maps.Size(22, 22), // scaled size
			origin: new google.maps.Point(0,0), // origin
			anchor: new google.maps.Point(11, 11) // anchor
		};

		currentLocationMarker = new google.maps.Marker({
			position: coordinate,
			icon: icon,
			shadow: null,
			clickable: false,
			draggable: false,
			map: map
		});

		sightingButton.bind('click', $scope.addTrackingPoint);
		disappearedButton.bind('click', $scope.addDisappearedPoint);
		clearButton.bind('click', $scope.clearTracking);
		helpButton.bind('click', $scope.openHelp);
		refreshButton.bind('click', $scope.refresh);
		undoButton.bind('click', $scope.undo);
		currentLocationButton.bind('click', $scope.currentLocation);

		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sightingButton[0]);
		map.controls[google.maps.ControlPosition.TOP_CENTER].push(helpButton[0]);
		map.controls[google.maps.ControlPosition.LEFT_BOTTOM].push(currentLocationButton[0]);

		if(localStorage.getItem("trackEmAll") !== null){
			if(moment().diff(moment(localStorage.getItem("trackEmAllTime"), 'MMMM Do YYYY, h:mm:ss a'), "minutes") >= 30){
				removeLocalStorage();
			}else{
				map.controls[google.maps.ControlPosition.TOP_RIGHT].push(clearButton[0]);
				map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(disappearedButton[0]);
				tracking = true;
				squares = JSON.parse(localStorage.getItem("trackEmAll"));
				_.each(squares, function(square){
					var activeMap = null;
					if(square.active){
						activeMap = map;
					}
					createRectangle(square.north, square.south, square.east, square.west, activeMap);
				});

				latitudeDifference = parseFloat(localStorage.getItem("trackEmAllLatitudeDifference"));
				longitudeDifference = parseFloat(localStorage.getItem("trackEmAllLongitudeDifference"));
			}
		}
	};

	addTrackingPointAtPosition = function(position){
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude};

		if(!tracking){
			buildStartingSquares(coordinate);
			map.controls[google.maps.ControlPosition.TOP_RIGHT].push(clearButton[0]);
			map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(disappearedButton[0]);
			map.setCenter(coordinate);
			tracking = true;
		}

		appearancePoints.push(coordinate);
		appearanceOrDisappearance.push(true);
		track(coordinate, true);
		currentLocationMarker.setPosition(coordinate);
		hideLoading();
	};

	addDisappearedPointAtPosition = function(position) {
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude};
		disappearancePoints.push(coordinate);
		appearanceOrDisappearance.push(false);
		track(coordinate, false);
		currentLocationMarker.setPosition(coordinate);
		hideLoading();
	};

	showLoading = function(){
		$(".loading-background").show();
	};

	hideLoading = function(){
		$(".loading-background").hide();
	};
});

initMap = function(){};

app.config(function($routeProvider) {
  $routeProvider

  .when('/', {
    templateUrl : 'pages/home.html',
    controller  : 'HomeController'
  })

  .when('/privacy', {
    templateUrl : 'pages/privacy.html',
    controller  : 'HomeController'
  })
  
  .otherwise({redirectTo: '/'});
});

var mapStyle = [
  {
    "featureType": "road",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "poi",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "transit",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "water",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "landscape",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  },{
    "featureType": "administrative",
    "elementType": "labels",
    "stylers": [
      { "visibility": "off" }
    ]
  }
];