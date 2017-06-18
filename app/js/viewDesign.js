var infoOperations = 
				{not: "Отрицание",
				and: "Логическое «И»",
				or: "Логическое «ИЛИ»",
				nor: "Стрелка Пирса",
				xor: "Исключающее «ИЛИ»",
				nand: "Штрих Шеффера"
			};
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
  		
  		$scope.showConfirm = function(ev) {
    		// Appending dialog to document.body to cover sidenav in docs app
	    var confirm = $mdDialog.confirm()
	          .title('Would you like to delete your debt?')
	          .textContent('All of the banks have agreed to forgive you your debts.')
	          .ariaLabel('Lucky day')
	          .targetEvent(ev)
	          .ok('Please do it!')
	          .cancel('Sounds like a scam');

	    $mdDialog.show(confirm).then(function() {
	      $scope.status = 'You decided to get rid of your debt.';
	    }, function() {
	      $scope.status = 'You decided to keep your debt.';
	    });
	  };

		$scope.showAdvanced = function(ev,to) {
			typeOper = to;
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
  			$scope.infoOp = infoOperations;
		    $scope.typeOperation = typeOper;
			if($scope.typeOperation == 'not'){
				$scope.tableTruth = buildTTable(1, formulaToTruthTabl(1, '! x1'));
 				$scope.boolExp = getViewTypeOp('not');
			}
 			else{
				$scope.tableTruth = buildTTable(2, formulaToTruthTabl(2, getOut($scope.typeOperation,'x1','x2')));
 				$scope.boolExp =  getViewTypeOp($scope.typeOperation);
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
