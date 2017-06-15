var headerApp = angular.module('headerApp',['kmapApp','exprApp','routingApp','userInfoApp','designApp','drawCircuitApp']);

//Позволяет инициализировать массив с нужными числами
headerApp.filter('range', function() {
    return function(input, min, max) {
        min = parseInt(min); //Make string input int
        max = parseInt(max);
        for (var i = min; i < max; i++)
            input.push(i);
        return input;
    };
});
