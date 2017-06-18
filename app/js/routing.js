var routingApp = angular.module('routingApp', ['ui.router']);

routingApp.run(function ($state, $rootScope) {
        $rootScope.$state = $state;
});

routingApp.controller('changeLvl', function($stateParams, $scope){
    $scope.level = $stateParams.level;
    $scope.probares = $stateParams.probares;
})

routingApp.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/home');

    $stateProvider
        .state('home', {
            url: '/home',
            templateUrl: '/app-part/partial-home.html'
        })

        .state('levels',{
            url: '/levels',
            templateUrl: '/app-part/levels.html'
        })

        .state('level', {
            url: '/level',
            templateUrl: '/app-part/level.html',
            controller: 'changeLvl',
            params: {
                level: 11,
                probares: ['0.7','0.6','0.8','0.7','1','0','0.9']
            }
        })

        .state('help', {
            url: '/help',
            templateUrl: '/app-part/partial-help.html'
        })

        .state('kmap', {
          url: '/karnaughmap',
          templateUrl: '/app-part/partial-kmap.html'
        })

        .state('about', {
            url: '/about',
            templateUrl: '/app-part/partial-about.html'     
        });
});
