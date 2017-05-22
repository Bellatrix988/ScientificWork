var exprApp = angular.module('exprApp',[]);

exprApp.controller("buildCtrl", function($scope, InitGrammarService){
  setupGrammar = function(countVariable, prob){
    InitGrammarService.setupGrammar(countVariable, prob);
  } 
  
  $scope.countVariable = 4;
  $scope.list = [];
  $scope.generateFormula = function(lvl, probare){
      $scope.countVariable = lvl;
      setupGrammar($scope.countVariable, probare);
      $scope.list.addExpression(cfree.getExpression('E'));
  }
});

//сохраняем уникальность форумул
Array.prototype.addExpression = function(str){
    if(this.indexOf(str) == -1)
        this.unshift(str);
};

//заполнение грамматики
function initGrammar(){
  this.setupGrammar = function(countVariable, prob) {
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

        
        // cfree.addRule('F', [ not,'F'], probares[4]);
        // cfree.addRule('F', [ not,'(','E', ')']);
        cfree.addRule('F', [ '(','E', ')'], probares[5]);

        //добовляем переменные 
        for(var i = 0; i < variables.length; i++){
          cfree.addRule('F', [variables[i]], probares[6]);
          // cfree.addRule('F', [not, variables[i]],'1');
        }
  }
}

exprApp.service('InitGrammarService', initGrammar);

// angular.bootstrap
// (document.getElementByClassName("buildFormula"),["exprApp"]);

