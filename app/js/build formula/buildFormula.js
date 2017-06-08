var exprApp = angular.module('exprApp',[]);

exprApp.service('InitGrammarService', initGrammar);
exprApp.controller("buildCtrl", function($scope, InitGrammarService){
  setupGrammar = function(countVariable, prob){
    InitGrammarService.setupGrammar(countVariable, prob);
  } 
  setupCountVars = function(lvl){
    if(lvl >= 1 && lvl <= 4)
      $scope.countVariable = 2;
    if(lvl >= 5 && lvl <= 10)
      $scope.countVariable = 3;
    if(lvl >= 11 && lvl <= 16)
      $scope.countVariable = 4;
    if(lvl >= 17 && lvl <= 23)
      $scope.countVariable = 5;
    if(lvl >= 24 && lvl <= 30)
      $scope.countVariable = 6;
  }

  $scope.level;
  $scope.countVariable;
  $scope.Min;
  $scope.probares;
  $scope.list = [];

  $scope.initLoad = function(){
    setupCountVars($scope.level);
    setupGrammar($scope.countVariable, $scope.probares);
    $scope.list.addExpression(cfree.getExpression('E'));
    $scope.Min = (getMinFormulaFrom($scope.countVariable,$scope.list[0]));
  }

});

//сохраняем уникальность форумул
Array.prototype.addExpression = function(str){
    if(this.indexOf(str) == -1)
        this.unshift(str);
};

function initGrammar(){
  this.setupGrammar = function(countVariable, prob){
    cfree = new ContextFree();
    var probares = ['1','1','1','1','1','1','1'];
    if(prob)
      probares = prob;
    //заполняем переменными
    var variables = [];
      for(i = 1; i <= countVariable; i++)
        variables[i - 1] = "x" + i.toString();

        //при повышении уровня будут добавляться
        var operationsPriorityFirst = ['&&'];
        var operationsPrioritySecond = ['||'];
        var not = '!';

        for(var j = 0; j < operationsPrioritySecond.length; j++)
          cfree.addRule('E', [ 'T',operationsPrioritySecond[j], 'T'], probares[0]);
       cfree.addRule('E', ['T'], probares[1]);

        for(var j = 0; j < operationsPriorityFirst.length; j++)
          cfree.addRule('T', [ 'F',operationsPriorityFirst[j], 'F'], probares[2]);
       cfree.addRule('T', ['F'], probares[3]);
        // cfree.addRule('T', [ 'not','T'], 0.8);

        
        cfree.addRule('F', [ not,'F'], probares[4]);
        // cfree.addRule('F', [ not,'(','E', ')']);
        cfree.addRule('F', [ '(','E', ')'], probares[5]);

        //добовляем переменные 
        for(var i = 0; i < variables.length; i++){
          cfree.addRule('F', [variables[i]], probares[6]);
          // cfree.addRule('F', [not, variables[i]],'0.9');
        }
  }
}

//заполнение грамматики
function generateGrammar(countVariable, prob){
  cfree = new ContextFree();
    var probares = ['1','1','1','1','1','1','1'];
    if(prob)
      probares = prob;
    //заполняем переменными
    var variables = [];
      for(i = 1; i <= countVariable; i++)
        variables[i - 1] = "x" + i.toString();

        //при повышении уровня будут добавляться
        var operationsPriorityFirst = ['&&'];
        var operationsPrioritySecond = ['||'];
        var not = '!';

        for(var j = 0; j < operationsPrioritySecond.length; j++)
          cfree.addRule('E', [ 'T',operationsPrioritySecond[j], 'T'], probares[0]);
       cfree.addRule('E', ['T'], probares[1]);

        for(var j = 0; j < operationsPriorityFirst.length; j++)
          cfree.addRule('T', [ 'F',operationsPriorityFirst[j], 'F'], probares[2]);
       cfree.addRule('T', ['F'], probares[3]);
        // cfree.addRule('T', [ 'not','T'], 0.8);

        
        cfree.addRule('F', [ not,'F'], probares[4]);
        // cfree.addRule('F', [ not,'(','E', ')']);
        cfree.addRule('F', [ '(','E', ')'], probares[5]);

        //добовляем переменные 
        for(var i = 0; i < variables.length; i++){
          cfree.addRule('F', [variables[i]], probares[6]);
          // cfree.addRule('F', [not, variables[i]],'0.9');
        }
}

// angular.bootstrap
// (document.getElementByClassName("buildFormula"),["exprApp"]);

