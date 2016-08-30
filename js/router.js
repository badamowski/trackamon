app.config(function($routeProvider) {
  $routeProvider

  .when('/', {
    templateUrl : 'pages/home.html',
    controller  : 'HomeController'
  })

  .when('/v2', {
    templateUrl : 'pages/v2.html',
    controller  : 'HomeV2Controller'
  })

  .otherwise({redirectTo: '/'});
});