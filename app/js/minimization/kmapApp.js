function Cell() {
  this.position = [0.0, 0.0];
  this.value = false;
  this.active = false;
  this.uniqueID = -1;
  this.truthmapID = -1;
  this.variablesText = {
  	leftSide: "",
  	topSide: ""
  };
  this.variable = "";
  this.covered = false;
}

var kmapApp = angular.module("kmapApp",[]);

//for select number variable
kmapApp.filter('range', function() {
  return function(input, min, max) {
    min = parseInt(min); //Make string input int
    max = parseInt(max);
    for (var i=min; i<max; i++)
      input.push(i);
    return input;
  };
});

kmapApp.controller("tableKMap", function($scope,FormulaService){
	
	getFormula = function(countVariable, []){
		return FormulaService.generateFormula(countVariable, []);
	}

	getMinFormula = function(cellsMap){
		return FormulaService.getMinFormula(cellsMap);
	}



	$scope.countVariable = 4;

	$scope.changeSelectedItem = function(){
		$scope.formula = getFormula($scope.countVariable, []); //"x1 && x2";
		$scope.minFormula = getMinFormula($scope.cellsMap);
	}

	$scope.formula = getFormula($scope.countVariable, []); //"x1 && x2";
	// $scope.minFormula = getMinFormula($scope.cellsMap);//"x1 && x2";//getFormula($scope.countVariable, []); FACTORY!

	//получаем матрицу
	var tTable = formulaToTruthTabl($scope.countVariable, $scope.formula);
	//задали высоту и ширину ячеек
	$scope.fieldScale = 40;
  	$scope.cellsTTable = [];
  	$scope.cellsMap = new Array();
  	$scope.computeScale;
	$scope.myinit = function(){

		var n = $scope.countVariable;
		var c = Math.floor((n+1)/2);
		var r = Math.floor(n/2);
		//вычисляем размеры карты
		this.columnsMap = Math.pow(2,c); 
		this.rowsMap = Math.pow(2,r);

		$scope.cellsMap.Width = this.columnsMap;
		$scope.cellsMap.Height = this.rowsMap;

		this.columns = tTable[0].length; //Math.pow(2,c); 
		this.rows = tTable.length; //Math.pow(2,r);
		
		$scope.cellsTTable.Width = this.columns;
		$scope.cellsTTable.Height = this.rows;



    	this.fieldBorder = c * 20;

		$scope.cellsTTable.length = 0;
		$scope.cellsMap.length = 0;

		//вычисление высоты и ширины svg
		$scope.computeScale = function(x){
			return x * $scope.fieldScale + this.fieldBorder;
		}	

		//truth table
	    for (var i = 0; i < this.rows; i++) {
	      for (var j = 0; j < this.columns; j++) {
	        var field = new Cell();
	        field.position[0] = this.fieldBorder + j * $scope.fieldScale;
	        field.position[1] = this.fieldBorder + i * $scope.fieldScale;
	        field.value = parseInt(tTable[i][j]);
	        field.variable = ((j+1) == this.columns)? "f" : "x" + (j + 1);
	        $scope.cellsTTable.push(field);
	      }
    	}
    	var IndArr = initIndexArr(n);
      	var ind = 2;
      	
    	//map 
	  var id = 0;
	    for (var i = 0; i < this.rowsMap; i++) {
	    	$scope.cellsMap[i] = [];
	      for (var j = 0; j < this.columnsMap; j++) {
	        var field = new Cell();
	        field.position[0] = this.fieldBorder + j * $scope.fieldScale;
	        field.position[1] = this.fieldBorder + i * $scope.fieldScale;
	        field.value = parseInt(tTable[IndArr[j] + IndArr[i]* this.columnsMap][n])  == 1 ? true : false; //$scope.cellsTTable[ind].value; //
	        field.uniqueID = ((j+1) == this.columns)? "f" : "x" + (j + 1);
	        field.variable = field.value?$scope.cellsTTable[ind].variables : "!"+$scope.cellsTTable[ind].variables;
	        $scope.cellsMap[i].push(field);
	        field.variablesText.leftSide = tTable[IndArr[j] + IndArr[i]* this.columnsMap].slice(0,r).join('');
	        field.variablesText.topSide = tTable[IndArr[j] + IndArr[i]* this.columnsMap].slice(r,r + c).join('');
	        id++;
	        ind = ind + $scope.countVariable + 1;
	      }
	    }
	    $scope.minFormula = getMinFormula($scope.cellsMap);
	}
});

kmapApp.service('FormulaService', getFormula);

kmapApp.controller("DrawMap", function($scope){

}); 

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

  getMin = function(KMap){
		function createContour(x,y,w,h){
			let Obj= [];
			Obj.x = x;
			Obj.y = y;
			Obj.w = w;
			Obj.h = h;
			return Obj;
		}
		
		function Compare(x,y){
			return x == y;
		}

		function TestRect( Rect, TestValue )
		{
			var dx=0;
			var dy=0;
			for (dx=0; dx<Rect.w; dx++)
			{
				for (dy=0; dy<Rect.h; dy++)
				{
					var Test = KMap[(Rect.x+dx)%KMap.Width][(Rect.y+dy)%KMap.Height].value;
					if (!Compare(TestValue,Test))
					{
						return false;
					}
				}
			}
			return true;
		}

		function IsCovered( Rect )
		{
			var dx=0;
			var dy=0;
			for (dx=0; dx<Rect.w; dx++)
			{
				for (dy=0; dy<Rect.h; dy++)
				{
					if (!KMap[(Rect.x+dx)%KMap.Width][(Rect.y+dy)%KMap.Height].covered) 
					{
						return false;
					}
				}
			}
			return true;
		}

		function Cover( Rect, IsCovered )
		{
			var dx=0;
			var dy=0;
			for (dx=0; dx<Rect.w; dx++)
			{
				for (dy=0; dy<Rect.h; dy++)
				{
					KMap[(Rect.x+dx)%KMap.Width][(Rect.y+dy)%KMap.Height].covered = IsCovered;
				}
			}
		}

		function SearchRect( w,h, TestValue, Found, DoCover )
		{
			if ((w>KMap.Width) || (h>KMap.Height))
			{
				return;  // rect is too large
			}
				
			var x=0;
			var y=0;
			var across = (KMap.Width==w) ?1:KMap.Width;
			var down   = (KMap.Height==h)?1:KMap.Height;
			for (x=0; x<across; x++)
			{
				for (y=0; y<down; y++)
				{
					var Rect = createContour(x,y,w,h);
					if (TestRect(Rect,TestValue))
					{
						if (!IsCovered(Rect))
						{
							Found.push(Rect);
							if (DoCover) Cover(Rect, true);
						}
					}
				}
			}
		}

		function Search(){
			var Rects = new Array();
		    Cover(createContour(0, 0, KMap.Width, KMap.Height), false);

		    // Find the (larger) rectangles that cover just the quares in the KMap
		    //  and search for smaller and smaller rects
		    // SearchRect(4, 4, true, Rects, true);
		    // SearchRect(4, 2, true, Rects, true);
		    // SearchRect(2, 4, true, Rects, true);
		    // SearchRect(1, 4, true, Rects, true);
		    // SearchRect(4, 1, true, Rects, true);
		    SearchRect(2, 2, true, Rects, true);

		    // 2x1 sized rects  - These have to be handled specially in order to find a 
		    //  minimized solution.  
		    var Rects2x1 = new Array();
		    SearchRect(2, 1, true, Rects2x1, false);
		    SearchRect(1, 2, true, Rects2x1, false);
		    //FindBestCoverage(Rects2x1, Rects);

		    // add the 1x1 rects
		    SearchRect(1, 1, true, Rects, true);
		    return Rects;
		    //check to see if any sets of (necessary) smaller rects fully cover larger ones (if so, the larger one is no longer needed)
		 //    Cover(createContour(0, 0, KMap.Width, KMap.Height), false);
		 //    for (i = Rects.length - 1; i >= 0; i--)
		 //    {
		 //        if (IsCovered(Rects[i]))
		 //        {
		 //            Rects[i] = null;
		 //        }
		 //        else
		 //        {
		 //            Cover(Rects[i], true);
		 //        }
		 //    }
			
			// ClearEquation();	
			// for (i=0;i<Rects.length; i++)
			// {
			// 	if (Rects[i]!=null)
			// 	{
			// 		RectToEquation(Rects[i]);
			// 	}
			// }
			// if (Equation.UsedLength==0)
			// {
			// 	Equation.UsedLength=1;
			// 	Equation[0].Expression="0";
			// 	Equation[0].Rect = createContour(0,0,KMap.Width,KMap.Height);
			// }
		}
		function MinFormula(){
				var result = Search();
				console.log("result",result.length);
				var res = result[0];
				return KMap[res.x][res.y].uniqueID;
		}
		return MinFormula();
			
	}

 this.getMinFormula = function(KMap){
	return getMin(KMap); 	
 }
}

//преобразовывает текстовую форму функции в таблицу истинности
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

//генерирует соответсвующий массив индексов для ТИ
function initIndexArr(n) {
 	var result = [];
 	switch(n) {
		 case 1:
			result = [0,1];
			break;
		case 2: 
			result = [0,1,2,3];
			break;
		case 3:
		case 4: 
		 	result = [0,1,3,2];
		 	break;
		case 5:
		case 6:
			result = [0,1,3,2,4,5,7,6];
			break;
		case 7:
		case 8:
			result = [0,1,3,2,6,7,5,4,12,13,15,14,10,11,9,8];
			break;
 	}
	return result;
}
