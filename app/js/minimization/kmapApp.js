//Объект ячейки для хранения инф-ии необходимой для вывода
function Cell() {
    this.position = [0.0, 0.0];
    this.value = false;
    this.color = "#fff";
    this.uniqueID = -1; //для связи с выражением
    this.truthmapID = -1;	//для связи с таблицей истинности
    this.variablesText = {
        leftSide: "",
        topSide: ""
    };
    this.variable = "";
    this.covered = false;
}

function Term(){
	this.value = "";
	this.ID = -1;
}
var kmapApp = angular.module("kmapApp", ['ngMaterial']);


//Контроллер для связи логики и представления карты Карно и ТИ
kmapApp.controller("tableKMap", function($scope, FormulaService) {

    //Генерируем новую формулу
    getFormula = function(countVariable, []) {
        return FormulaService.generateFormula(countVariable, []);
    }

    //Получаем минимизированную формулу
    getMinFormula = function(cellsMap) {
        return FormulaService.getMinFormula(cellsMap);
    }

    //Количество переменных в формуле
    $scope.countVariable = 5;
    //Начальная сгенерированная формула
    $scope.formula = '!x1 && !x2 && x3 && x5 || x1 && !x2 && !x4 && !x5 || !x1 && !x3 && x4 && !x5 || !x1 && !x2 && x4 && !x5 || !x1 && !x3 && !x4 && !x5 || x1 && x4 && x5'//getFormula($scope.countVariable, []); //"x1 && ! x2 || ( x1 || ! x2 && ! x1 ) && x2";//
	$scope.colors = ['darkred','darkorange','springgreen','olive','saddlebrown','darkcyan','midnightblue','darkviolet','mediumvioletred','green','blue','yellow'];

    //инициализирует основные элементы логики для связи с UI
    $scope.initFormUI = function() {
        //получаем матрицу
        var tTable = formulaToTruthTabl($scope.countVariable, $scope.formula);
        //задали высоту и ширину ячеек
        $scope.fieldScale = 30;
        $scope.cellsTTable = new Array();
        $scope.cellsMap = new Array();

        this.fieldBorder = Math.floor(($scope.countVariable + 1) / 2) * 15;

        //вычисление высоты и ширины svg
        $scope.computeScale = function(x) {
            return x * $scope.fieldScale + this.fieldBorder;
        }

		$scope.computePosition = function(x) {
            return x * $scope.fieldScale + this.fieldBorder;
        }
    	$scope.clearFild = function(){
			$scope.cellsMap = buildKMap($scope.countVariable, tTable, true);
			$scope.formula = "";
			$scope.minFormula = "";
		}

        $scope.cellsTTable = buildTTable($scope.countVariable, tTable);
        $scope.cellsMap = buildKMap($scope.countVariable, tTable);
        
        //вызываем функцию минимизации после того, как заполнили массив карты
        $scope.minFormula = getMinFormula($scope.cellsMap);
    }
 
    //Вызывается при изменении количетва переменных. Обновляются формулы и UI
    $scope.changeSelectedItem = function() {
        $scope.formula = getFormula($scope.countVariable, []); //"x1 && x2";
        $scope.minFormula = getMinFormula($scope.cellsMap);
        $scope.initFormUI();
    }

    $scope.changeValueInKMap = function(){
    	$scope.minFormula = getMinFormula($scope.cellsMap);
    }

    $scope.changeColor = function(id, color){
		$scope.cellsMap.forEach(function(item){
			item.forEach(function(itemIn){
				if(itemIn.uniqueID == id)
					itemIn.color = color;
			})
		})
	};
});

//Сервис для получени формул(случайной и минимизированной)
kmapApp.service('FormulaService', getFormula);

///###########Вспомогательные функции##############

//Строит карту Карно по таблице истинности
function buildKMap(countVars, tTable, flag){
	var IndArr = initIndexArr(countVars);

	var cellsMap = new Array();

    var c = Math.floor((countVars + 1) / 2);
    var r = Math.floor(countVars / 2);

    //вычисляем размеры карты
    cellsMap.Width = Math.pow(2, c);
    cellsMap.Height = Math.pow(2, r);
    //Заполняем массив карты и ее поля для вывода в UI
    for (var i = 0; i < cellsMap.Height; i++) {
        cellsMap[i] = [];
        for (var j = 0; j < cellsMap.Width; j++) {
            var field = new Cell();
    		if(flag)
    			field.value = false;
    		else
            	field.value = parseInt(tTable[IndArr[j] + IndArr[i] * cellsMap.Width][countVars]) == 1 ? true : false;
            //field.uniqueID = ((j + 1) == this.columns) ? "f" : "x" + (j + 1);
            field.variablesText.leftSide = tTable[IndArr[j] + IndArr[i] * cellsMap.Width].slice(0, r).join('');
            field.variablesText.topSide = tTable[IndArr[j] + IndArr[i] * cellsMap.Width].slice(r, r + c).join('');
            field.variable = toVariableText(field.variablesText);
            cellsMap[i].push(field);
        }
    }

    return cellsMap;
}

//Строит таблицу истинности для UI по таблице истинности
function buildTTable(countVars, tTable){
	var cellsTTable = new Array();

	cellsTTable.Width = tTable[0].length;
    cellsTTable.Height = tTable.length; 
	 for (var i = 0; i < cellsTTable.Height; i++) {
	 	cellsTTable[i] = [];
        for (var j = 0; j < cellsTTable.Width; j++) {
            var field = new Cell();
            field.value = parseInt(tTable[i][j]);
            field.variable = ((j + 1) == cellsTTable.Width) ? "f" : "x" + (j + 1);
            cellsTTable[i].push(field);
        }
    }
    return cellsTTable;
}

//Находит минимальную форму заданной формулы
function getMinFormulaFrom(countVars, formula){
    var tTable = formulaToTruthTabl(countVars, formula);
    var km = buildKMap(countVars, tTable);
    var res = [];
    getMin(km).forEach(function(item){
    	res.push(item.value);
    })
    return res.join(' || ');

}

///!!!Генерирует одно и то же. Нужно изменить. Да и вероятность убрать - она тут не нужна
function getFormula() {
    this.generateFormula = function(countVariable, probares) {
        generateGrammar(countVariable, probares);
        return cfree.getExpression('E');
    }
    this.getMinFormula = function(KMap) {
        return getMin(KMap);
    }
}

function getSelection(tTable, val){
    var result = [];
    tTable.forEach(function(item){
        var n = item.length - 1;
        if(item[n] == val)
            result.push(item);
    });
    return result;
}

function treeToFormula(tree){
    var inputTree = tree.input;
    return getOutFromObj(inputTree.typeOp, inputTree.input1, inputTree.input2);
}

//Преобразовывает текстовую форму функции в таблицу истинности
function formulaToTruthTabl(n, formula) {
    var truthTable = [];
    var m = Math.pow(2, n);
    for (let k = 0; k < m; k++) {
        var value = Array.from(k.toString(2));
        while (value.length < n)
            value.splice(0, 0, '0');
        value = value.join('');
        let arr = new Array();
        for (let i = 0; i < value.length; i++) {
            let j = i + 1;
            eval('var x' + (j) + ' = parseInt(value[i]);');
            arr.push(parseInt(value[i]));
        }
        var f = eval(formula);
        arr.push(f - 0);
        truthTable.push(arr);
    }
    console.log(truthTable);
    return truthTable;
}

//Генерирует соответсвующий массив индексов для ТИ
function initIndexArr(n) {
    var result = [];
    switch (n) {
        case 1:
            result = [0, 1];
            break;
        case 2:
            result = [0, 1, 2, 3];
            break;
        case 3:
        case 4:
            result = [0, 1, 3, 2];
            break;
        case 5:
        case 6:
            result = [0, 1, 3, 2, 6, 7, 5, 4];
            break;
        case 7:
        case 8:
            result = [0, 1, 3, 2, 6, 7, 5, 4, 12, 13, 15, 14, 10, 11, 9, 8];
            break;
    }
    return result;
}


function isPowerOfTwo(x) {
    return ((x != 0) && ((x & (~x + 1)) == x));
}

//преобразовывает бинарное значение переменной в текстовое
function toVariableText(variables){
	let res1 = "",
		res2 = "";
	var k;
	for(k = 0; k < variables.leftSide.length; k++){
		res1 += " " + (parseInt(variables.leftSide[k]) ? "x" + (k + 1) : "!x" + (k+1));
	}
	for(i = 0; i < variables.topSide.length; i++){
		res2 += " " + (parseInt(variables.topSide[i]) ? "x" + (i+ k + 1) : "!x" + (i+k+1));
	}
	return res1.trim() +" "+ res2.trim();
}

//Извлекает из карты проекцию контура
function copyPartMap(Contour, KMap){
	var kmHeight = setWidth(KMap.Height, Contour.x);
	var kmWidth = setWidth(KMap.Width, Contour.y);
	var k = 0, p = 0;
	var cellsInContours = [];
	for(var i = 0; i < Contour.height; i++){
		if(KMap.Height > 4)
    		p = setCoeffX(i,Contour, KMap.Height);
		for (var j = 0; j < Contour.width; j++){
			if(KMap.Width > 4)
           		k = setCoeffY(j, Contour, KMap.Width);
			cellsInContours = cellsInContours.concat(KMap[(Contour.x + i + p) % kmHeight][(Contour.y + j + k) % kmWidth]);
		}
	}
	return cellsInContours;
}

//Преобразует контур в соответствующее ему выражение
function bondingVars(contour, KMap){

	var resultExpression = [];
	var resWidth = [];//["11","11","11","11"]//[];
	var resHeight = [];//["00","01","11","10"]//[];
	let term = new Term();

	if(contour.width == KMap.Width && contour.height == KMap.Height)
		{
			term.value = 1;
			term.ID = 1;
			return term;
		}
	var realContour = copyPartMap(contour, KMap);

	realContour.forEach(function(item){
		item.uniqueID = contour.ID;
		resWidth.push(item.variablesText.topSide);
		resHeight.push(item.variablesText.leftSide);
	});
	// console.log("wh:",resWidth, resHeight);
	resWidth = resWidth.reduce(function(sum, item){
		return simplifiesExpression(sum, item);
	});
	// console.log("w",resWidth);
	resHeight = resHeight.reduce(function(sum, item){
		return simplifiesExpression(sum, item);
	});
	// console.log("h",resHeight);
	var res = resHeight.concat(resWidth);//["01","11"];
	// console.log(res);

	realContour.forEach(function(item){
		for(var k = 0; k < res.length; k++){
			if(res[k] != 'x'){
				let temp = item.variable.split(' ');
				resultExpression = resultExpression.includes(temp[k]) ?
                    resultExpression : (resultExpression. length == 0? temp[k] : resultExpression + ' && ' + temp[k]);
			}
		}
	})
	// console.log(resultExpression);
	term.value = resultExpression;
	term.ID = contour.ID;
	return term;
}

//склеивает 2 поданных на вход массива, учитывая, что 0 и 1 = x
function simplifiesExpression(sum, item){
	var result = new Array(sum.length);
	for (var i  = 0; i < sum.length; i++){
		if((parseInt(sum[i]) != parseInt(item[i])))
			result[i] = 'x';
		else
			result[i] = sum[i];
	}
	return result;
}

const unionArrays = (a, b) => Array.from(new Set([...a, ...b]));



 getMin = function(KMap) {
        //создание потенциального контура
        function createContour(x, y, w, h) {
            let Obj = [];
            Obj.x = x;
            Obj.y = y;
            Obj.width = w;
            Obj.height = h;
            Obj.ID = -1;
            return Obj;
        }

        //возвращает true
        function Compare(x, y) {
            return x == y;
        }

        //Возвращает true, если все значения в контуре равны образцу(0 или 1)
        function isFullEqSample(Contour, sample) {
    		var kmHeight = setWidth(KMap.Height, Contour.x);
    		var kmWidth = setWidth(KMap.Width, Contour.y);
    		var k = 0, p = 0;
            for (var i = 0; i < Contour.height; i++){
            	if(KMap.Height > 4)
            		p = setCoeffX(i,Contour, KMap.Height);
                for (var j = 0; j < Contour.width; j++) {
                	if(KMap.Width > 4)
                		k = setCoeffY(j, Contour, KMap.Width);
                    let Test = KMap[(Contour.x + i + p) % kmHeight][((Contour.y + j + k) % kmWidth)].value;
                    if (!Compare(sample, Test))
                        return false;
                }
            }
            return true;
        }

        //Возвращает false, если хотя бы один элемен из контура не помечен
        function isCovered(Contour) {
    		var kmWidth = setWidth(KMap.Width, Contour.y);
    		var kmHeight = setWidth(KMap.Height, Contour.x);
    		var k = 0, p = 0;;
            for (var i = 0; i < Contour.height; i++){
            	if(KMap.Height > 4)
            		p = setCoeffX(i,Contour, KMap.Height);
                for (var j = 0; j < Contour.width; j++){
    				if(KMap.Width > 4)
           				k = setCoeffY(j, Contour, KMap.Width);
                    if (!KMap[(Contour.x + i + p) % kmHeight][(Contour.y + j + k) % kmWidth].covered)
                        return false;
                }
            }
            return true;
        }

        //Помечает все элементы контура значением isCovered
        function Cover(Contour, isCovered) {
    		var kmWidth = setWidth(KMap.Width, Contour.y);
    		var kmHeight = setWidth(KMap.Height, Contour.x);
    		var k = 0, p = 0;
            for (var i = 0; i < Contour.height; i++){
            	if(KMap.Height > 4)
            		p = setCoeffX(i,Contour, KMap.Height);
                for (var j = 0; j < Contour.width; j++){
    				if(KMap.Width > 4)
           				k = setCoeffY(j, Contour, KMap.Width);
                    KMap[(Contour.x + i  + p) % kmHeight][(Contour.y + j + k) % kmWidth].covered = isCovered;
                }
            }
        }

        function searchContour(widthCont, heightCont, sample, ResultCont, DoCover) {
            if ((widthCont > KMap.Width) || (heightCont > KMap.Height)) {
                return; 
            var i,j;
            }
            var loopOfColumns = (KMap.Width == widthCont) ? 1 : KMap.Width;
            var loopOfRows = (KMap.Height == heightCont) ? 1 : KMap.Height;
            	// if(KMap.Width > 4)
            	// 	loopOfColumns = KMap.Width / widthCont;
            for (i = 0; i < loopOfRows; i++) {
                for (j = 0; j < loopOfColumns; j++) {
                    var Contour = createContour(i, j, widthCont, heightCont);
                    // if(((Contour.y % 4) + Contour.width) > 5)
                    // 	break;
                    if (isFullEqSample(Contour, sample)) {
                        if (!isCovered(Contour)) {
                        	Contour.ID = ResultCont.length + 1;
                            ResultCont.push(Contour);
                            if (DoCover) Cover(Contour, true);
                        }
                    }
                }

                // for(var k = loopOfColumns; k < KMap.Width; k++){
                // 	var Contour = createContour(i, k, widthCont, heightCont);
                //     if (isFullEqSample(Contour, sample)) {
                //         if (!isCovered(Contour)) {
                //         	Contour.ID = ResultCont.length + 1;
                //             ResultCont.push(Contour);
                //             if (DoCover) Cover(Contour, true);
                //         }
                //     }
                // }
            }
        }

        function search() {
            var Contours = new Array();
            Cover(createContour(0, 0, KMap.Width, KMap.Height), false);

            for(var row = KMap.Width; row > 0; row--)
             	for(var column = KMap.Height; column > 0; column--){
             		if(isPowerOfTwo(column * row)){
          				searchContour(row, column, true, Contours, true);
            			searchContour(column, row, true, Contours, true);
            		}
            	}
            return Contours;
        }

        function getResultExpr(contours){
        	if(contours.length == 0)
        		return 0;
        	var result = new Array(contours.length);
        	contours.forEach(function(item, i){
        		let help = bondingVars(item, KMap);
        		result[i] = help;
        	})

    		return result;
        }


        function MinFormula() {
            var result = search();
            console.log("result search Count", result.length);
            console.log("result arr[0]: ", result);
            return getResultExpr(result);
        }
        return MinFormula();
    }


function setWidth(width, y){
	var kmWidth = width; 
	if(width > 4)
	 	kmWidth = (y < 4) ? 4 : width;
	 return kmWidth;
}

setCoeffY = (j,contour, KMWidth) => (j >= (contour.width / 2)) ? ((KMWidth - 1 - contour.y) * 2) : 0;
setCoeffX = (i,contour, KMWidth) => (i >= (contour.height / 2)) ? ((KMWidth - 1 - contour.x) * 2) : 0;


String.prototype.replaceAll = function(c,r){
    return this.split(c).join(r);
}