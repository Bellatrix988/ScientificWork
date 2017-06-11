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
  $scope.tree = new Node();
  $scope.nodesArr;
  $scope.widthSVG;
  $scope.heightSVG;

  $scope.initLoad = function(){
    setupCountVars($scope.level);
    setupGrammar($scope.countVariable, $scope.probares);
    $scope.list.addExpression(cfree.getExpression('E',$scope.tree));
    $scope.Min = (getMinFormulaFrom($scope.countVariable,$scope.list[0]));
    $scope.nodesArr = initTreeNodes($scope.tree);
    $scope.nodesArr = $scope.nodesArr.sort(keysrt('id')).sort(keysrt('layer')).reverse();
    drawCircuit($scope.nodesArr);
    console.log('nodesArr',$scope.nodesArr[0] instanceof outCell,);
  }

  function drawCircuit(arr){
    var maxlvl = arr[0].layer;
    var border = 20;
    $scope.lenPath = 20;
    $scope.widthCell = 30;
    $scope.widthSVG = 0;
    // $scope.heightSVG = 0;
    arr.forEach(function(item, index){
      let lvl = maxlvl - item.layer;
      let borderHeight = (border + $scope.widthCell) * item.layerCount;
      let dist = ($scope.lenPath + $scope.widthCell + border);
      if(index == arr.length - 1)
        {
          $scope.widthSVG = index * dist + border;
          $scope.heightSVG = maxlvl * borderHeight;
          // item.position[1] =  $scope.heightSVG / 2;
        }
      var xChild, yChild;
      xChild = 0; 
      yChild = 0;
      if(item.input1 != null && item.input1 != null){
        item.value = eval(item.input1.value + item.typeOp + item.input2.value);
          if(item.input1.position[0] == 0){
            item.input1.position = getElemByID($scope.nodesArr, item.id).position;
          }
          if(item.input2.position[0] == 0){
            item.input2.position = getElemByID($scope.nodesArr, item.id).position;
          }
          let in1 = Math.max(item.input1.position[1],item.input2.position[1]);
          let in2 = Math.min(item.input1.position[1],item.input2.position[1]);
          xChild = 0;
          yChild = in2 + ((in1 - in2) / 2 - ($scope.widthCell / 2));
      }

      item.position[0] = xChild + border + lvl * dist;
      item.position[1] = yChild + border + borderHeight;
    })
  }

//вызывается при клике на входыне сигналы
$scope.changeValue = function(){
  $scope.nodesArr.forEach(function(item){
        if(item instanceof outCell){
          // item.input.getElemByID()
          item.value = item.input.value;
        } else{
          if(item.input1 != null && item.input1 != null){
            item.value = eval(item.input1.value + item.typeOp + item.input2.value);
          } 
  
        }
        
        item.color = item.value ? "green" : "orange";


       });
       console.log('nodesArr changeValue',$scope.nodesArr);
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

function setScoresVariables(countVariable){
   var variables = [];
      for(i = 1; i <= countVariable; i++)
        variables[i - 1] = "x" + i.toString();
  return variables;
}


//заполнение грамматики
function generateGrammar(countVariable, prob){
  cfree = new ContextFree();
    var probares = ['1','1','1','1','1','1','1'];
    if(prob)
      probares = prob;
    //заполняем переменными
    var variables = setScoresVariables(countVariable);

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


////для сортировки массива объектов по заданному полю
// sort on values
function srt(desc) {
  return function(a,b){
   return desc ? ~~(a < b) : ~~(a > b);
  };
}

// sort on key values
function keysrt(key,desc) {
  return function(a,b){
   return desc ? ~~(a[key] < b[key]) : ~~(a[key] > b[key]);
  }
}

