angular
	.module('designApp', ['ngMaterial'])
	.config(function($mdThemingProvider) {
  		$mdThemingProvider.theme('default')
    	.primaryPalette('green')
    	.accentPalette('orange')
	})
	.controller('AppCtrl', function($scope, $mdDialog) {
 		var typeOper = '';
		$scope.status = '  ';
  		$scope.customFullscreen = false;
  		changeTypeOp = function(typeOp){
			$scope.typeOperation = typeOp;
			if($scope.typeOperation == 'not'){
				$scope.tableTruth = buildTTable(1, formulaToTruthTabl(1, '! x1'));
 				$scope.boolExp = '¬x1';
			}
 			else{
				$scope.tableTruth = buildTTable(2, formulaToTruthTabl(2, getOut($scope.typeOperation,'x1','x2')));
 				$scope.boolExp = 'x1 ' + $scope.typeOperation + ' x2';
 			}
			// $scope.initFormUI();
  		}
		$scope.showAdvanced = function(ev,to) {
			// $scope.changeTypeOp(to);
			typeOper = to;
			// console.log(typeOper);
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
		    $scope.typeOperation = typeOper;
			if($scope.typeOperation == 'not'){
				$scope.tableTruth = buildTTable(1, formulaToTruthTabl(1, '! x1'));
 				$scope.boolExp = '¬x1';
			}
 			else{
				$scope.tableTruth = buildTTable(2, formulaToTruthTabl(2, getOut($scope.typeOperation,'x1','x2')));
 				$scope.boolExp = 'x1 ' + $scope.typeOperation + ' x2';
 			}
 			$scope.initFormUI = function() {

				$scope.fieldScale = 30;
				this.fieldBorder = 20;
       		 		$scope.computeScale = function(x) {
            		return x * $scope.fieldScale + this.fieldBorder;
       		}

				$scope.computePosition = function(x) {
           		 return x * $scope.fieldScale + this.fieldBorder;
        		}
			}
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

 	$scope.initFormUI = function() {
 		// console.log(typeOper);
 		// $scope.changeTypeOp(typeOper);
		$scope.fieldScale = 30;
		this.fieldBorder = 20;
		//вычисление высоты и ширины svg
        $scope.computeScale = function(x) {
            return x * $scope.fieldScale + this.fieldBorder;
        }

		$scope.computePosition = function(x) {
            return x * $scope.fieldScale + this.fieldBorder;
        }
	}
	});