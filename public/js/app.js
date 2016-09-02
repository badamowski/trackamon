var app = angular.module('trackamon', ['ngRoute']);

app.controller('ParentController', function($scope) {

});

app.controller('HomeController', function($scope) {
	var circles = [],
		currentLocationMarker, map;

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
		_.each(circles, function(circle){
			circle.setMap(null);
		});

		circles = [];
	};

	$scope.openHelp = function(){
		$("#help-modal").modal();
	};

	$scope.refresh = function(){
		_.each(circles, function(circle){
			circle.setMap(null);
		});

		_.each(circles, function(circle){
			circle.setMap(map);
		});

		findCurrentLocation(centerOnCurrentLocation);
	};

	$scope.undo = function(){
		if(circles.length > 0){
			var circle = circles.pop();
			circle.setMap(null);
		}
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
			mapTypeId: 'satellite',
			zoom: 17,
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

		var clearButton = $('<button class="btn btn-raised btn-danger btn-lg"><i class="fa fa-times-circle" aria-hidden="true"></i> Clear</button>'),
			sightingButton = $('<button class="btn btn-raised btn-success btn-lg"><i class="fa fa-crosshairs" aria-hidden="true"></i> Sighting</button>'),
			disappearedButton = $('<button class="btn btn-raised btn-warning btn-lg"><i class="fa fa-ban" aria-hidden="true"></i> Disappeared</button>'),
			helpButton = $('<button class="btn btn-raised btn-lg"><i class="fa fa-question-circle-o" aria-hidden="true"></i> Help</button>'),
			refreshButton = $('<button class="btn btn-raised btn-info btn-lg"><i class="fa fa-refresh" aria-hidden="true"></i> Refresh</button>'),
			undoButton = $('<button class="btn btn-raised btn-danger btn-lg"><i class="fa fa-undo" aria-hidden="true"></i> Undo</button>');

		sightingButton.bind('click', $scope.addTrackingPoint);
		disappearedButton.bind('click', $scope.addDisappearedPoint);
		clearButton.bind('click', $scope.clearTracking);
		helpButton.bind('click', $scope.openHelp);
		refreshButton.bind('click', $scope.refresh);
		undoButton.bind('click', $scope.undo);

		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sightingButton[0]);
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(disappearedButton[0]);
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(undoButton[0]);
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(refreshButton[0]);
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(clearButton[0]);
		map.controls[google.maps.ControlPosition.TOP_CENTER].push(helpButton[0]);
	};

	addTrackingPointAtPosition = function(position){
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude},
			cityCircle = new google.maps.Circle({
			strokeColor: '#00FF00',
			strokeOpacity: 0.5,
			strokeWeight: 1,
			fillColor: '#00FF00',
			fillOpacity: 0.3,
			map: map,
			center: coordinate,
			radius: 200,
			zIndex: 5
		});
		circles.push(cityCircle);
		map.setCenter(coordinate);
		currentLocationMarker.setPosition(coordinate);
	};

	addDisappearedPointAtPosition = function(position) {
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude},
			cityCircle = new google.maps.Circle({
			strokeColor: '#FF0000',
			strokeOpacity: 0.5,
			strokeWeight: 1,
			fillColor: '#FF0000',
			fillOpacity: 0.5,
			map: map,
			center: coordinate,
			radius: 200,
			zIndex: 10
		});
		circles.push(cityCircle);
		currentLocationMarker.setPosition(coordinate);
	};
});

initMap = function(){};