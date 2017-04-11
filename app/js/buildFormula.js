var model = [];
var cfree;

//angular model-controller
var viewFormula = angular.module("viewFormula", []);

viewFormula.controller("formController",function($scope){
    $scope.countVariable = 3;
    $scope.list = model;

    $scope.addItem = function () {
        $scope.list.unshift(cfree.getExpression('E'));
    }
})

function setupGrammar() {
  
  cfree = new ContextFree();

  //заполняем переменными
  var variables = [];
  var countVars = document.getElementById("countVariable");
    for(i = 1; i <= countVars.value; i++)
      variables[i - 1] = "x" + i.toString();

  //при повышении уровня будут добавляться
  var operationsPriorityFirst = ['and'];
  var operationsPrioritySecond = ['or'];

  //добавляем правила

  for(var j = 0; j < operationsPrioritySecond.length; j++)
    cfree.addRule('E', [ 'T',operationsPrioritySecond[j], 'T']);
 cfree.addRule('E', ['T']);


  for(var j = 0; j < operationsPriorityFirst.length; j++)
    cfree.addRule('T', [ 'F',operationsPriorityFirst[j], 'F']);
  cfree.addRule('T', [ 'F']);
  // cfree.addRule('T', [ 'not','T']);

  
  cfree.addRule('F', [ 'not','F']);
  // cfree.addRule('F', [ 'not','(','E', ')']);
  cfree.addRule('F', [ '(','E', ')']);

  //добовляем переменные 
  for(var i = 0; i < variables.length; i++){
    cfree.addRule('F', [variables[i]]);
    // cfree.addRule('F', ['not', variables[i]]);
  }
}

