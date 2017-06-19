var exprApp = angular.module('exprApp',['designApp']);

//для инициализации грамматики
exprApp.service('InitGrammarService', initGrammar);

exprApp.controller("buildCtrl", function($scope, InitGrammarService){
  //устанавливает грамматику необходимого вида в зависимости от кол-ва переменных и вероятностей
  setupGrammar = function(countVariable, prob){
    InitGrammarService.setupGrammar(countVariable, prob);
  } 
  //устанавливает кол-во переменных для каждого уровня
  setupCountVars = function(lvl){
    if(lvl >= 1 && lvl <= 4){
      $scope.countVariable = 2;
      $scope.probares = $scope.probresSegment[0];
    }
    if(lvl >= 5 && lvl <= 10){
      $scope.countVariable = 3;
    }
    if(lvl >= 11 && lvl <= 16)
      $scope.countVariable = 4;
    if(lvl >= 17 && lvl <= 23)
      $scope.countVariable = 5;
    if(lvl >= 24 && lvl <= 31)
      $scope.countVariable = 6;
  }

  $scope.level;
  $scope.countVariable;
  $scope.probares;
  $scope.probresSegment = [
  ['0.8','0.7','0.7','0.6','0','0','1'],
  ['0.7','0.6','0.6','0.7','0','0','1'],
  ['0.7','0.6','0.6','0.7','1','0','0.9'],
  ['0.8','0.6','0.8','0.7','1','0','0.9']
];
  $scope.list = [];
  $scope.tree = new Node();
  $scope.nodesArr;
  $scope.widthSVG;
  $scope.heightSVG; 
  $scope.countUserClick = 0;
  $scope.userClick = function() {
    $scope.countUserClick++;
  }

  $scope.initLoad = function(){
    setupCountVars($scope.level);
    setupGrammar($scope.countVariable, $scope.probares);
    $scope.list.addExpression(cfree.getExpression('E', $scope.tree));
    $scope.nodesArr = initTreeNodes($scope.tree);
    $scope.nodesArr = $scope.nodesArr.sort(keysrt('id')).sort(keysrt('layer')).reverse();
    setInputVector($scope.nodesArr);
    drawCircuit($scope.nodesArr);
    console.log('nodesArr',$scope.nodesArr);
  }
  //Используется для подключения отдельного svg - файла   
  $scope.getPathGate = function(typeOp){
    return 'img/gates/' + typeOp + '.svg';
  }
  function setInputVector(arr){
        arr.forEach(function(item, index){
        if(item instanceof outCell){
            var truthSelection = getSelection(formulaToTruthTabl($scope.countVariable,treeToFormula(item)),1);
            var falseSelection = getSelection(formulaToTruthTabl($scope.countVariable,treeToFormula(item)),0);
            var mySelect = falseSelection.choiceRandom();
            for(var i = 0; i < mySelect.length; i++){
              let varX = 'x' + (i + 1);
              // let elem = item.input.getById(varX);
              let elem = getElemByID(arr, varX);
              if(elem != null){
                elem.value = mySelect[i] == 1? true : false;
                elem.color = elem.value ? "green" : "orangered";
              }
            }
            console.log("TRUTH SELECTION:", truthSelection, mySelect);
         }
       });
  }
  //возвращает массив координат пути для дочернего элемента
  function drawLogicPath(parent, child, flag){
      var borederCell = $scope.widthCell * 36 / 100;
      if(parent.gateType == 'not' || parent.gateType == 'out') 
        borederCell = $scope.widthCell / 2;
      var lenPathIn = 20;
      var y;
      if(flag == 1)
        y = parent.position[1] + borederCell;
      else
        y = (parent.position[1] + $scope.widthCell) - borederCell;
      var countPath = Math.abs(child.position[0] - parent.position[0]) / $scope.lenPath - 2;
      var coords = new Array(4);
      if(parent.gateType == 'not' || parent.gateType == 'out'){
        coords[0] = [0,0];
        coords[0][0] = child.position[0] + $scope.widthCell;
        coords[0][1] = child.position[1] +  $scope.widthCell / 2;
        coords[1] = [0,0];
        coords[1][0] = coords[0][0] + $scope.lenPath + lenPathIn + 4;
        coords[1][1] = coords[0][1];
        coords[2] = coords[1];
        coords[3] = coords[1];
        return coords;
      }

      coords[0] = [0,0];
      coords[0][0] = child.position[0] + $scope.widthCell - 5;
      coords[0][1] = child.position[1] +  $scope.widthCell / 2;
      coords[1] = [0,0];
      coords[1][0] = coords[0][0] + $scope.lenPath * countPath + 5;
      coords[1][1] = coords[0][1];
      coords[2] = [0,0];
      coords[2][0] = coords[1][0];
      coords[2][1] = y;
      coords[3] = [0,0];
      coords[3][0] = coords[2][0] + borederCell*2;
      coords[3][1] = coords[2][1];
      return coords;
  }
  //Заполняет поля объектов массива для вывода
  function drawCircuit(arr){
      var maxlvl = arr[0].layer;
      var border = 20;
      $scope.widthCell = 50;
      $scope.lenPath = 40;
      $scope.widthSVG = 0;

      arr.forEach(function(item, index){
        let lvl = maxlvl - item.layer;
        let borderHeight = (border + $scope.widthCell) * item.layerCount;
        let dist = ($scope.lenPath + $scope.widthCell + border);
        if(item instanceof outCell){
            item.value = eval(getOut(item.input.typeOp, item.input.input1.value, item.input.input2.value));
            item.position[1] = item.input.position[1];
            item.position[0] = item.input.position[0] + $scope.lenPath + $scope.widthCell;
            item.input.arrayOfPosPath = drawLogicPath(item, item.input, 1);
            $scope.widthSVG = (index +1) * dist + border;
            $scope.heightSVG = (maxlvl + 1) * borderHeight;
         }
         else{
            var xChild, yChild;
            xChild = 0; 
            yChild = 0;
            if(item.input1 != null && item.input2 != null){
              item.value = eval(getOut(item.typeOp,item.input1.value,item.input2.value));
                //Если позиция элемента нулевая, то задаем
                //ему позицию элемента с таким же id(если есть)
                if(item.input1.position[0] == 0){
                  item.input1.position = getElemByID($scope.nodesArr, item.id).position;
                }
                if(item.input2.position[0] == 0){
                  item.input2.position = getElemByID($scope.nodesArr, item.id).position;
                }
               
                let in1 = Math.max(item.input1.position[1],item.input2.position[1]);
                let in2 = Math.min(item.input1.position[1],item.input2.position[1]);
               
               yChild = in2 + (((in1 - in2) - $scope.widthCell) / 2);
                item.position[0] = xChild + border + lvl * dist;
                item.position[1] = yChild + border;
                item.input1.arrayOfPosPath = drawLogicPath(item, item.input1, 1);
                item.input2.arrayOfPosPath = drawLogicPath(item, item.input2, 2);
                item.value =  eval(getOut(item.typeOp,item.input1.value,item.input2.value));
                item.color = item.value ? "green" : "orangered";
            } else{
            if(item.input1 != null && item.input2 == null){ //унарная операция
              item.value = eval(getOut(item.typeOp,item.input1.value,null));
              item.input1.arrayOfPosPath = drawLogicPath(item, item.input1, 1);
              item.value = eval(getOut(item.typeOp,item.input1.value, null));
            }
            item.position[0] = xChild + border + lvl * dist;
            item.position[1] = yChild + border + borderHeight;
            item.color = item.value ? "green" : "orangered";
          }
        }
      })
  }

  //вызывается при клике на входыне сигналы
  $scope.changeValue = function(){
    function winner() {
       var rating = computeRating($scope.countUserClick);
       console.log("rating", rating);
        alert('Your winner. Rating: ', computeRating($scope.countUserClick));
    }

    $scope.nodesArr.forEach(function(item){
          if(item instanceof outCell){
            item.value = item.input.value;
            if(item.value == true){
              setTimeout(winner, 500);
            }
          } else{
            if(item.input1 != null && item.input2 != null){
              item.value =  eval(getOut(item.typeOp,item.input1.value,item.input2.value));
            } 
            if(item.input1 != null && item.input2 == null){
              item.value = eval(getOut(item.typeOp,item.input1.value, null));
            }
          }
          item.color = item.value ? "green" : "orangered";
         });
         console.log('nodesArr changeValue',$scope.nodesArr);
  }

}); // end controller buildCtrl

exprApp.directive('gate', function() {
      return {
      restrict: 'E',
      replace: true,      
      templateUrl: 'img/gates/gate.svg',
      };
  });

///#########Вспомогательные функции

//вычисление рейтинга будет зависеть от входного и выходного вектора
function computeRating(countUserClick){
    if(countUserClick < 5)
    return 3;
    if(countUserClick > 5 && countUserClick < 7)
      return 2;
    if(countUserClick > 7 && countUserClick < 10)
      return 1;
}



//region grammarFunc

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
          var operationsPriorityFirst = ['and'];
          var operationsPrioritySecond = ['or','nor'];
          var not = 'not';//'!';
         
         cfree.addRule('E', [ 'T',operationsPrioritySecond[0], 'T'], parseInt(probares[0]) - 0.1);
          for(var j = 0; j < operationsPrioritySecond.length; j++)
            cfree.addRule('E', [ 'T',operationsPrioritySecond[j], 'T'], probares[0]);
         cfree.addRule('E', ['T'], probares[1]);

         cfree.addRule('T', [ 'F',operationsPriorityFirst[0], 'F'],  parseInt(probares[2]) - 0.1);
          for(var j = 0; j < operationsPriorityFirst.length; j++)
            cfree.addRule('T', [ 'F',operationsPriorityFirst[j], 'F'], probares[2]);
         cfree.addRule('T', ['F'], probares[3]);
          // cfree.addRule('T', [ 'not','T'], 0.8);

          
          cfree.addRule('F', [ not,'F'], probares[4]);
          // cfree.addRule('F', [ not,'(','E', ')']);
          cfree.addRule('F', [ not,'E' ], probares[5]);

          //добовляем переменные 
          for(var i = 0; i < variables.length; i++){
            cfree.addRule('F', [variables[i]], probares[6]);
            // cfree.addRule('F', [not, variables[i]],'0.9');
          }
    }
  }

  //Возвращает массив переменных в строковом формате
  //в зависимости от заданного кол-ва 
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
//endregion

//region exprFromTree
  //Формирует выражение, пригодное для вычисления
  //по заданному объекту дерева
  function getOutFromObj(op, in1, in2){
    if(in1 == null && in2 == null)
      return op;
    switch(op){
      case 'not':
        return '! ' + getOutFromObj(in1.typeOp, in1.input1, null);
        break;
      case 'and':
        return getOutFromObj(in1.typeOp, in1.input1, in1.input2) + ' && ' + getOutFromObj(in2.typeOp, in2.input1, in2.input2);
        break;
      case 'or':
        return getOutFromObj(in1.typeOp, in1.input1, in1.input2) + ' || ' +getOutFromObj(in2.typeOp, in2.input1, in2.input2);
        break;
      case "xor":
        return getOutFromObj(in1.typeOp, in1.input1, in1.input2) + ' ^ ' + getOutFromObj(in2.typeOp, in2.input1, in2.input2);
        break;
      case 'nand':
        return '! (' + getOutFromObj('and', in1, in2) + ')';
        break;
      case 'nor':
        return '! (' + getOutFromObj('or', in1, in2) + ')';
        break;
    }
  };

  //Для заданных значений(не объектов) формирует выражение,
  //пригодное для вычисления
  function getOut(op, in1, in2){
    switch(op){
      case 'not':
        return '! ' + in1;
        break;
      case 'and':
        return in1 + ' && ' + in2;
        break;
      case 'or':
        return in1 + ' || ' + in2;
        break;
      case "xor":
        return in1 + ' ^ ' + in2;
        break;
      case 'nand':
        return '! (' + getOut('and', in1, in2) + ')';
        break;
      case 'nor':
        return '! (' + getOut('or', in1, in2) + ')';
        break;
      default: 
    }
  };

  //Возвращает тексовое значение для заданной операции
  function getViewTypeOp(op){
    switch(op){
      case 'not':
        return '¬x1';
        break;
      case 'and':
        return 'x1' + ' ⋀ ' + 'x2';
        break;
      case 'or':
        return 'x1' + ' ⋁ ' + 'x2';
        break;
      case "xor":
        return 'x1' + ' ^ ' + 'x2';
        break;
      case 'nand':
        return 'x1' + ' | ' + 'x2';
        break;
      case 'nor':
        return 'x1' + ' ↓ ' + 'x2';
        break;
    }
  };
//endregion

//region funcOfArray
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
//endregion