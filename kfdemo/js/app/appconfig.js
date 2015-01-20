/* rout configuration */
app.config(function ($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
    $routeProvider.when('/detail', {
        templateUrl: 'detail.html',
        controller: detailCtrl
    });

});

app.config(['$locationProvider', function($locationProvider) {
//        $locationProvider.html5Mode(true);
    }]);
