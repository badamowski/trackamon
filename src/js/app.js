var app = angular.module('trackamon', ['ngRoute']);

app.controller('ParentController', function($scope) {

});

app.controller('HomeController', function($scope) {
	var circles = [],
		appearancePoints = [],
		disappearancePoints = [],
		appearanceOrDisappearance = [],
		squares = [],
		tracking = false,
		accuracy = 10,
		range = 200,
		distanceForAppearance = (range + accuracy)/accuracy,
		distanceForDisappearance = (range - accuracy)/accuracy,
		clearButton = $('<button class="btn btn-raised btn-danger btn-lg"><i class="fa fa-times-circle" aria-hidden="true"></i> Clear</button>'),
		sightingButton = $('<button class="btn btn-raised btn-success btn-lg"><i class="fa fa-crosshairs" aria-hidden="true"></i> Sighting</button>'),
		disappearedButton = $('<button class="btn btn-raised btn-warning btn-lg"><i class="fa fa-ban" aria-hidden="true"></i> Disappeared</button>'),
		helpButton = $('<button class="btn btn-raised btn-lg"><i class="fa fa-question-circle-o" aria-hidden="true"></i> Help</button>'),
		refreshButton = $('<button class="btn btn-raised btn-info btn-lg"><i class="fa fa-refresh" aria-hidden="true"></i> Re-Draw</button>'),
		undoButton = $('<button class="btn btn-raised btn-danger btn-lg"><i class="fa fa-undo" aria-hidden="true"></i> Undo</button>'),
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
		findCurrentLocation(addTrackingPointAtPosition);
	};

	$scope.addDisappearedPoint = function(){
		findCurrentLocation(addDisappearedPointAtPosition);
	};

	$scope.clearTracking = function(){
		_.each(squares, function(square){
			square.rectangle.setMap(null);
		});

		squares = [];
		tracking = false;
		appearancePoints = [];
		disappearancePoints = [];
		appearanceOrDisappearance = [];

		map.controls[google.maps.ControlPosition.TOP_RIGHT].pop();
		//map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].pop();
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].pop();
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].pop();
	};

	$scope.openHelp = function(){
		$("#help-modal").modal();
	};

	$scope.refresh = function(){
		_.each(squares, function(square){
			square.rectangle.setMap(null);
		});

		_.each(squares, function(square){
			if(square.active){
				square.rectangle.setMap(map);
			}
		});

		findCurrentLocation(centerOnCurrentLocation);
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

	track = function(coordinate, isAppearance){
		var maxLat = coordinate.lat, 
			maxLng = coordinate.lng, 
			minLat = coordinate.lat,
			minLng = coordinate.lng;

		_.each(squares, function(square){
			if(square.active){
				var latitudeLength = (square.centerLatitude - coordinate.lat)/latitudeDifference,
					longitudeLength = (square.centerLongitude - coordinate.lng)/longitudeDifference,
					distanceToCenter = Math.sqrt((latitudeLength*latitudeLength) + (longitudeLength*longitudeLength));

				if((isAppearance && distanceToCenter > distanceForAppearance)
					|| (!isAppearance && distanceToCenter < distanceForDisappearance)){
					square.rectangle.setMap(null);
					square.active = false;
				} else {
					if(square.north > maxLat){
						maxLat = square.north;
					}

					if(square.south < minLat){
						minLat = square.south;
					}

					if(square.east > maxLng){
						maxLng = square.east;
					}

					if(square.west < minLng){
						minLng = square.west;
					}
				}
			}
		});
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

		var rectangle = new google.maps.Rectangle({
			strokeWeight: 0,
			fillColor: '#00FF00',
			fillOpacity: 0.35,
			map: map,
			bounds: {
				north: north,
				south: south,
				east: east,
				west: west
			}
		});

		squares.push({
			active: true,
			north: north,
			south: south,
			east: east,
			west: west,
			centerLatitude: (north+south)/2,
			centerLongitude: (east+west)/2,
			rectangle: rectangle
		});	
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
	};

	loadInitialMap = function(position){
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude};

		map = new google.maps.Map(document.getElementById('map'), {
			center: coordinate,
			mapTypeId: 'satellite',
			zoom: 16,
			streetViewControl: false,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL,
				position: google.maps.ControlPosition.LEFT_BOTTOM
			}
		});

		currentLocationMarker = new google.maps.Marker({
			position: coordinate,
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 5,
				fillColor: "#00BFFF",
				fillOpacity: 1.0,
				strokeColor: "#00BFFF",
				strokeOpacity: 1.0,
				zIndex: 20
			},
			draggable: false,
			map: map
		});

		sightingButton.bind('click', $scope.addTrackingPoint);
		disappearedButton.bind('click', $scope.addDisappearedPoint);
		clearButton.bind('click', $scope.clearTracking);
		helpButton.bind('click', $scope.openHelp);
		refreshButton.bind('click', $scope.refresh);
		undoButton.bind('click', $scope.undo);

		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sightingButton[0]);
		map.controls[google.maps.ControlPosition.TOP_CENTER].push(helpButton[0]);

		if(!sessionStorage.getItem("TrackEmAll")){
			$("#help-modal").modal();
			sessionStorage.setItem("TrackEmAll", true);
		}
	};

	addTrackingPointAtPosition = function(position){
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude};

		if(!tracking){
			buildStartingSquares(coordinate);
			map.controls[google.maps.ControlPosition.TOP_RIGHT].push(clearButton[0]);
			map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(disappearedButton[0]);
			//map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(undoButton[0]);
			map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(refreshButton[0]);
			tracking = true;
		}

		appearancePoints.push(coordinate);
		appearanceOrDisappearance.push(true);
		track(coordinate, true);
		currentLocationMarker.setPosition(coordinate);
	};

	addDisappearedPointAtPosition = function(position) {
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude};
		disappearancePoints.push(coordinate);
		appearanceOrDisappearance.push(false);
		track(coordinate, false);
		currentLocationMarker.setPosition(coordinate);
	};
});

initMap = function(){};

app.config(function($routeProvider) {
  $routeProvider

  .when('/', {
    templateUrl : 'pages/home.html',
    controller  : 'HomeController'
  })
  
  .otherwise({redirectTo: '/'});
});