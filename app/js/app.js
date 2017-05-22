var routingApp = angular.module('routingApp', ['ui.router']);
var cfree;

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
            templateUrl: '/app-part/level2.html',
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


var headerApp = angular.module('headerApp',['kmapApp','exprApp','routingApp','userInfoApp']);
// headerApp.filter('unique', function() {
//    return function(collection, keyname) {
//       var output = [], 
//           keys = [];

//       angular.forEach(collection, function(item) {
//           var key = item[keyname];
//           if(keys.indexOf(key) === -1) {
//               keys.push(key);
//               output.push(item);
//           }
//       });

//       return output;
//    };
// });
