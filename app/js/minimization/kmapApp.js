var kmapApp = angular.module("kmapApp",[]);

kmapApp.controller("tableKMap", function($scope,FormulaService){
	
	getFormula = function(countVariable, []){
		return FormulaService.generateFormula(countVariable, []);
	}

	$scope.countVariable = 2;
	$scope.formula = getFormula($scope.countVariable, []); //"x1 && x2";
	$scope.minFormula =  "x1 && x2";//getFormula($scope.countVariable, []);
	// $scope.X = 1;
	// $scope.myFunc = function(){
	// 	$scope.X = 0;
	// }
	//получаем матрицу
	$scope.tTable = formulaToTruthTabl($scope.countVariable, $scope.formula);

	//задали высоту и ширину ячеек
	$scope.fieldHeight = 40;
  	$scope.fieldWidth = 40;
  	$scope.cells = [];
	$scope.myinit = function(){

		var n = $scope.countVariable;
		let c = Math.floor((n+1)/2);
		let r = Math.floor(n/2);
		//вычисляем размеры карты
		this.columns = $scope.tTable[0].length; //Math.pow(2,c); 
		this.rows = $scope.tTable.length; //Math.pow(2,r);
    	this.fieldBorder = c * 20;

		$scope.cells.length = 0;

		var id = 0;
	    for (var i = 0; i < this.rows; i++) {
	      for (var j = 0; j < this.columns; j++) {
	        var field = new Cell();
	        field.position[0] = this.fieldBorder + j * this.fieldWidth;
	        field.position[1] = this.fieldBorder + i * this.fieldHeight;
	        field.value = parseInt($scope.tTable[i][j]);
	        field.uniqueID = id;
	        $scope.cells.push(field);
	        id++;
	      }
    	}
	}
});

// angular.
//   bootstrap(document.getElementById("kmap"), ['kmapApp']);


///!!!Генерирует одно и то же. Нужно изменить. Да и вероятность убрать - она тут не нужна
function getFormula(){
  //заполнение грамматики
  setupGrammar = function(countVariable, prob) {
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
  this.generateFormula = function(countVariable, probares){
	setupGrammar(countVariable, probares);
	return cfree.getExpression('E');
  }
}

function formulaToTruthTabl(n,formula){
	var truthTable = [];
	var m = Math.pow(2,n);
	for(let k = 0; k < m; k++){
		var value = Array.from(k.toString(2));
		while(value.length < n)
			value.splice(0,0,'0');
		value = value.join('');
		let arr = new Array();
	 	for(let i = 0; i < value.length; i++){
	 		let j = i + 1;
	 		eval('var x'+(j)+ ' = parseInt(value[i]);'); 
	 		arr.push(parseInt(value[i]));
		}
	var f = eval(formula);
	arr.push(f);
	truthTable.push(arr);
	}
	console.log(truthTable);
	return truthTable;
}

kmapApp.service('FormulaService', getFormula);
// angular.directive("ngRect",ngRect);



kmapApp.controller("DrawTruthTable", function($scope){

});




function Cell() {
  this.position = [0.0, 0.0];
  this.value = 0;
  this.active = false;
  this.uniqueID = -1;
  this.truthmapID = -1;
}


/*kmapApp.controller("DrawMap", function($scope){
	//задали высоту и ширину ячеек
	$scope.fieldHeight = 40;
  	$scope.fieldWidth = 40;

	$scope.myinit = function(){
		var n = $scope.countVariable;
		let c = Math.floor((n+1)/2);
		let r = Math.floor(n/2);
		//вычисляем размеры карты
		this.columns = tTable.length; //Math.pow(2,c); 
		this.rows = tTable[0].length; //Math.pow(2,r);
    	this.fieldBorder = c * 20;

		$scope.cells.length = 0;

		var id = 0;
	    for (var i = 0; i < this.rows; i++) {
	      for (var j = 0; j < this.columns; j++) {
	        var field = new Cell();
	        field.position[0] = this.fieldBorder + j * this.fieldWidth;
	        field.position[1] = this.fieldBorder + i * this.fieldHeight;
	        field.value = tTable[i][j];
	        field.uniqueID = id;
	        $scope.cells.push(field);
	        id++;
	      }
    	}
	}
}); 
*/