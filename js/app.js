var app = angular.module('trackamon', ['ngRoute']);

app.controller('ParentController', function($scope) {

});

app.controller('HomeController', function($scope) {
	var trackCircles = [],
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

	$scope.clearTracking = function(){
		_.each(trackCircles, function(trackCircle){
			trackCircle.setMap(null);
		});
	};

	loadInitialMap = function(position){
		map = new google.maps.Map(document.getElementById('map'), {
			center: {lat: position.coords.latitude, lng: position.coords.longitude},
			mapTypeId: 'satellite',
			zoom: 18
		});
	};

	addTrackingPointAtPosition = function(position){
		var coordinate = {lat: position.coords.latitude, lng: position.coords.longitude},
			cityCircle = new google.maps.Circle({
			strokeColor: '#FF0000',
			strokeOpacity: 0.5,
			strokeWeight: 1,
			fillColor: '#FF0000',
			fillOpacity: 0.15,
			map: map,
			center: coordinate,
			radius: 75
		});
		trackCircles.push(cityCircle);
		map.setCenter(coordinate);
	};
});

initMap = function(){};