angular.module('drawCircuitApp', []);

angular.module('drawCircuitApp')
	.directive('gate', function() {
    	return {
			restrict: 'E',
			replace: true,			
			// templateUrl: 'app-part/level2.html'
			templateUrl: 'img/gates/gate.svg',
			// template: 'img/gates/{{typeGate}}.svg',

			//template: '<h1>{{typeGate}}</h1>',
			// scope: {
   //    			typeGate: '@tyg'
   //  		}
			// templateNamespace: 'svg'
	    };
	});