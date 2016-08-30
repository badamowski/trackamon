var app = angular.module('trackamon', ['ngRoute']);

app.controller('ParentController', function($scope) {

});

app.controller('HomeController', function($scope) {
	var trackCircles = [],
		disappearedCircles = [],
		map;

	$scope.init = function(){
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(loadInitialMap);
		} else {
			$scope.message = "Geolocation is not supported by this browser.";
		}
	};

	$scope.addTrackingPoint = function(){
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(addTrackingPointAtPosition);
		} else {
			$scope.message = "Geolocation is not supported by this browser.";
		}
	};

	$scope.addDisappearedPoint = function(){
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(addDisappearedPointAtPosition);
		} else {
			$scope.message = "Geolocation is not supported by this browser.";
		}
	};

	$scope.clearTracking = function(){
		_.each(trackCircles, function(trackCircle){
			trackCircle.setMap(null);
		});
	};

	$scope.openHelp = function(){
		$("#help-modal").modal();
	};

	loadInitialMap = function(position){
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: position.coords.latitude, lng: position.coords.longitude},
			mapTypeId: 'satellite',
			zoom: 17,
			streetViewControl: false,
			zoomControlOptions: {
				style: google.maps.ZoomControlStyle.SMALL,
				position: google.maps.ControlPosition.LEFT_BOTTOM
			}
		});

		var clearButton = $('<button class="btn btn-raised btn-danger btn-lg"><i class="fa fa-times-circle" aria-hidden="true"></i> Clear</button>'),
			sightingButton = $('<button class="btn btn-raised btn-success btn-lg"><i class="fa fa-crosshairs" aria-hidden="true"></i> Sighting</button>'),
			disappearedButton = $('<button class="btn btn-raised btn-warning btn-lg"><i class="fa fa-ban" aria-hidden="true"></i> Disappeared</button>'),
			helpButton = $('<button class="btn btn-raised btn-lg"><i class="fa fa-question-circle-o" aria-hidden="true"></i> Help</button>');

		sightingButton.bind('click', $scope.addTrackingPoint);
		disappearedButton.bind('click', $scope.addDisappearedPoint);
		clearButton.bind('click', $scope.clearTracking);
		helpButton.bind('click', $scope.openHelp);

		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(sightingButton[0]);
		map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(disappearedButton[0]);
		map.controls[google.maps.ControlPosition.RIGHT_TOP].push(clearButton[0]);
		map.controls[google.maps.ControlPosition.TOP_RIGHT].push(helpButton[0]);
	};

	addTrackingPointAtPosition = function(position){
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude},
			cityCircle = new google.maps.Circle({
			strokeColor: '#008000',
			strokeOpacity: 0.5,
			strokeWeight: 1,
			fillColor: '#008000',
			fillOpacity: 0.15,
			map: map,
			center: coordinate,
			radius: 200
		});
		trackCircles.push(cityCircle);
		map.setCenter(coordinate);
	};

	addDisappearedPointAtPosition = function(position) {
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude},
			cityCircle = new google.maps.Circle({
			strokeColor: '#FF0000',
			strokeOpacity: 0.5,
			strokeWeight: 1,
			fillColor: '#FF0000',
			fillOpacity: 0.15,
			map: map,
			center: coordinate,
			radius: 200
		});
		trackCircles.push(cityCircle);
		map.setCenter(coordinate);
	};
});

initMap = function(){};