var model = [];
var cfree;

//angular model-controller
var viewFormula = angular.module("viewFormula", []);

viewFormula.controller("formController",function($scope){
    $scope.list = model;
    $scope.addItem = function () {
        $scope.list.push(cfree.getExpression('E'));
    }
})

function setupGrammar() {
  
  cfree = new ContextFree();

  //заполняем переменными
  var variables = [];
  var countVars = document.getElementById("countVariable");
    for(i = 1; i <= countVars.value; i++)
      variables[i-1] = "x" + i.toString();

  //при повышении уровня будут добавляться
  var operations = ['and', 'or'];

  //добавляем правила
  for(var j = 0; j < operations.length; j++)
    cfree.addRule('E', [ 'E',operations[j], 'T']);
  
  cfree.addRule('E', ['T']);
  for(var j = 0; j < operations.length; j++)
    cfree.addRule('T', [ 'T',operations[j], 'F']);
  
  cfree.addRule('T', [ 'F']);
  cfree.addRule('T', [ 'not','F']);
  cfree.addRule('F', [ '(','E', ')']);

  //добовляем переменные 
  for(var i = 0; i < variables.length; i++)
    cfree.addRule('F', [variables[i]]);

  // cfree.addRule('E', ['(','T', ')']);
  // cfree.addRule('E', ['T']);
  // for(var j = 0; j < operations.length; j++)
  //   cfree.addRule('T', [ 'F',operations[j], 'F']);
  // cfree.addRule('T', [ 'F']);
  // cfree.addRule('T', [ 'not','F']);
  // cfree.addRule('F', [ 'E']);

}

window.onload = function(){
  setupGrammar();
}