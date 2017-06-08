angular
	.module('designApp', ['ngMaterial'])
	.config(function($mdThemingProvider) {
  		$mdThemingProvider.theme('default')
    	.primaryPalette('green')
    	.accentPalette('orange')
	})
	.controller('AppCtrl', function($scope, $mdDialog) {
		$scope.status = '  ';
  		$scope.customFullscreen = false;
		$scope.showAdvanced = function(ev) {
		    $mdDialog.show({
		      controller: DialogController,
		      templateUrl: '/app-part/operation.html',
		      parent: angular.element(document.body),
		      targetEvent: ev,
		      clickOutsideToClose:true,
		      fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
		    })
		    .then(function(answer) {
		      $scope.status = 'You said the information was "' + answer + '".';
		    }, function() {
		      $scope.status = 'You cancelled the dialog.';
		    });
  		};
  		function DialogController($scope, $mdDialog) {
		    $scope.hide = function() {
		      $mdDialog.hide();
		    };

		    $scope.cancel = function() {
		      $mdDialog.cancel();
		    };

		    $scope.answer = function(answer) {
		      $mdDialog.hide(answer);
		    };
  		}
		$scope.fieldScale = 30;
		this.fieldBorder = 20;
		//вычисление высоты и ширины svg
        $scope.computeScale = function(x) {
            return x * $scope.fieldScale + this.fieldBorder;
        }

		$scope.computePosition = function(x) {
            return x * $scope.fieldScale + this.fieldBorder;
        }
		$scope.tableTruth = buildTTable(2, formulaToTruthTabl(2, "x1 && x2"));
	});