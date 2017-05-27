//Объект ячейки для хранения инф-ии необходимой для вывода
function Cell() {
    this.position = [0.0, 0.0];
    this.value = false;
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

//Позволяет инициализировать массив с нужными числами
kmapApp.filter('range', function() {
    return function(input, min, max) {
        min = parseInt(min); //Make string input int
        max = parseInt(max);
        for (var i = min; i < max; i++)
            input.push(i);
        return input;
    };
});

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
    $scope.countVariable = 2;

    //Начальная сгенерированная формула
    $scope.formula = "x1 && ! x2 || ( x1 || ! x2 && ! x1 ) && x2";//getFormula($scope.countVariable, []);

    //инициализирует основные элементы логики для связи с UI
    $scope.initFormUI = function() {
        //получаем матрицу
        var tTable = formulaToTruthTabl($scope.countVariable, $scope.formula);
        //задали высоту и ширину ячеек
        $scope.fieldScale = 40;
        $scope.cellsTTable = [];
        $scope.cellsMap = new Array();
        $scope.computeScale;
        var n = $scope.countVariable;

        var c = Math.floor((n + 1) / 2);
        var r = Math.floor(n / 2);

        //вычисляем размеры карты
        this.columnsMap = Math.pow(2, c);
        this.rowsMap = Math.pow(2, r);

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
        $scope.computeScale = function(x) {
            return x * $scope.fieldScale + this.fieldBorder;
        }

        //Заполняем таблицу истинности и ее поля для вывода в UI
        for (var i = 0; i < this.rows; i++) {
            for (var j = 0; j < this.columns; j++) {
                var field = new Cell();
                field.position[0] = this.fieldBorder + j * $scope.fieldScale;
                field.position[1] = this.fieldBorder + i * $scope.fieldScale;
                field.value = parseInt(tTable[i][j]);
                field.variable = ((j + 1) == this.columns) ? "f" : "x" + (j + 1);
                $scope.cellsTTable.push(field);
            }
        }
        var IndArr = initIndexArr(n);
        var ind = 2;

        //Заполняем массив карты и ее поля для вывода в UI
        for (var i = 0; i < this.rowsMap; i++) {
            $scope.cellsMap[i] = [];
            for (var j = 0; j < this.columnsMap; j++) {
                var field = new Cell();
                field.position[0] = this.fieldBorder + j * $scope.fieldScale;
                field.position[1] = this.fieldBorder + i * $scope.fieldScale;
                field.value = parseInt(tTable[IndArr[j] + IndArr[i] * this.columnsMap][n]) == 1 ? true : false; //$scope.cellsTTable[ind].value; //
                field.uniqueID = ((j + 1) == this.columns) ? "f" : "x" + (j + 1);
                $scope.cellsMap[i].push(field);
                field.variablesText.leftSide = tTable[IndArr[j] + IndArr[i] * this.columnsMap].slice(0, r).join('');
                field.variablesText.topSide = tTable[IndArr[j] + IndArr[i] * this.columnsMap].slice(r, r + c).join('');
                field.variable = toVariableText(field.variablesText);

                
                ind = ind + $scope.countVariable + 1;
            }
        }
        //вызываем функцию минимизации после того, как заполнили массив карты
        $scope.minFormula = getMinFormula($scope.cellsMap);
    }

    //Вызывается при изменении количетва переменных. Обновляются формулы и UI
    $scope.changeSelectedItem = function() {
        $scope.formula = getFormula($scope.countVariable, []); //"x1 && x2";
        $scope.minFormula = getMinFormula($scope.cellsMap);
        $scope.initFormUI();
    }
});

//Сервис для получени формул(случайной и минимизированной)
kmapApp.service('FormulaService', getFormula);

///###########Вспомогательные функции##############

///!!!Генерирует одно и то же. Нужно изменить. Да и вероятность убрать - она тут не нужна
function getFormula() {
    //заполнение грамматики
    setupGrammar = function(countVariable, prob) {
        cfree = new ContextFree();
        var probares = ['1', '1', '1', '1', '1', '1', '1'];
        if (prob)
            probares = prob;
        //заполняем переменными
        var variables = [];
        for (i = 1; i <= countVariable; i++)
            variables[i - 1] = "x" + i.toString();

        //при повышении уровня будут добавляться
        var operationsPriorityFirst = ['&&'];
        var operationsPrioritySecond = ['||'];
        var not = '!';

        for (var j = 0; j < operationsPrioritySecond.length; j++)
            cfree.addRule('E', ['T', operationsPrioritySecond[j], 'T'], probares[0]);
        cfree.addRule('E', ['T'], probares[1]);

        for (var j = 0; j < operationsPriorityFirst.length; j++)
            cfree.addRule('T', ['F', operationsPriorityFirst[j], 'F'], probares[2]);
        cfree.addRule('T', ['F'], probares[3]);
        // cfree.addRule('T', [ 'not','T'], 0.8);


        // cfree.addRule('F', [ not,'F'], probares[4]);
        // cfree.addRule('F', [ not,'(','E', ')']);
        cfree.addRule('F', ['(', 'E', ')'], probares[5]);

        //добовляем переменные 
        for (var i = 0; i < variables.length; i++) {
            cfree.addRule('F', [variables[i]], probares[6]);
            //cfree.addRule('F', [not, variables[i]], probares[6]);
        }
    }
    this.generateFormula = function(countVariable, probares) {
        setupGrammar(countVariable, probares);
        return cfree.getExpression('E');
    }

    getMin = function(KMap) {
        //создание потенциального контура
        function createContour(x, y, w, h) {
            let Obj = [];
            Obj.x = x;
            Obj.y = y;
            Obj.width = w;
            Obj.height = h;
            return Obj;
        }

        //возвращает true
        function Compare(x, y) {
            return x == y;
        }

        //Возвращает true, если все значения в контуре равны образцу(0 или 1)
        function isFullEqSample(Contour, sample) {
            for (let i = 0; i < Contour.width; i++)
                for (let j = 0; j < Contour.height; j++) {
                    let Test = KMap[(Contour.x + i) % KMap.Width][(Contour.y + j) % KMap.Height].value;
                    if (!Compare(sample, Test))
                        return false;
                }
            return true;
        }

        //Возвращает false, если хотя бы один элемен из контура не помечен
        function isCovered(Contour) {
            for (let i = 0; i < Contour.width; i++)
                for (let j = 0; j < Contour.height; j++)
                    if (!KMap[(Contour.x + i) % KMap.Width][(Contour.y + j) % KMap.Height].covered)
                        return false;
            return true;
        }

        //Помечает все элементы контура значением isCovered
        function Cover(Contour, isCovered) {
            for (i = 0; i < Contour.width; i++)
                for (j = 0; j < Contour.height; j++)
                    KMap[(Contour.x + i) % KMap.Width][(Contour.y + j) % KMap.Height].covered = isCovered;
        }


        function SearchContour(widthCont, heightCont, sample, ResultCont, DoCover) {
            if ((widthCont > KMap.Width) || (heightCont > KMap.Height)) {
                return; 
            }
            var loopOfColumns = (KMap.Width == widthCont) ? 1 : KMap.Width;
            var loopOfRows = (KMap.Height == heightCont) ? 1 : KMap.Height;
            for (i = 0; i < loopOfColumns; i++) {
                for (j = 0; j < loopOfRows; j++) {
                    var Contour = createContour(i, j, widthCont, heightCont);
                    if (isFullEqSample(Contour, sample)) {
                        if (!isCovered(Contour)) {
                            ResultCont[ResultCont.length] = Contour;
                            if (DoCover) Cover(Contour, true);
                        }
                    }
                }
            }
        }

        function Search() {
            var Contours = new Array();
            Cover(createContour(0, 0, KMap.Width, KMap.Height), false);

            // Find the (larger) Contourangles that cover just the quares in the KMap
            //  and search for smaller and smaller Contours
            // SearchContour(4, 4, true, Contours, true);
            // SearchContour(4, 2, true, Contours, true);
            // SearchContour(2, 4, true, Contours, true);
            // SearchContour(1, 4, true, Contours, true);
            // SearchContour(4, 1, true, Contours, true);
            SearchContour(2, 2, true, Contours, true);

            // 2x1 sized Contours  - These have to be handled specially in order to find a 
            //  minimized solution.  
            var Contours2x1 = new Array();
            SearchContour(2, 1, true, Contours2x1, false);
            SearchContour(1, 2, true, Contours2x1, false);
            //FindBestCoverage(Contours2x1, Contours);

            // add the 1x1 Contours
            SearchContour(1, 1, true, Contours, true);

            return Contours;
            //check to see if any sets of (necessary) smaller Contours fully cover larger ones (if so, the larger one is no longer needed)
            //    Cover(createContour(0, 0, KMap.Width, KMap.Height), false);
            //    for (i = Contours.length - 1; i >= 0; i--)
            //    {
            //        if (isCovered(Contours[i]))
            //        {
            //            Contours[i] = null;
            //        }
            //        else
            //        {
            //            Cover(Contours[i], true);
            //        }
            //    }

            // ClearEquation();	
            // for (i=0;i<Contours.length; i++)
            // {
            // 	if (Contours[i]!=null)
            // 	{
            // 		ContourToEquation(Contours[i]);
            // 	}
            // }
            // if (Equation.UsedLength==0)
            // {
            // 	Equation.UsedLength=1;
            // 	Equation[0].Expression="0";
            // 	Equation[0].Contour = createContour(0,0,KMap.Width,KMap.Height);
            // }
        }

        function getResultExpr(contours){
        	var result = new Array(contours.length);
    		var resExpr = "";
        	contours.forEach(function(current){
        		var cellsInContours = copyPartMap(current, KMap);
        		cellsInContours.forEach(function(cell){
        			resExpr += cell.variable;
        		})
        	});
    		return resExpr;
        }

        function MinFormula() {
            var result = Search();
            console.log("result Search Count", result.length);
            console.log("result arr[0]: ", result);
            return getResultExpr(result);
        }
        return MinFormula();
    }

    this.getMinFormula = function(KMap) {
        return getMin(KMap);
    }
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
            result = [0, 1, 3, 2, 4, 5, 7, 6];
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
		res1 += parseInt(variables.leftSide[k]) ? "x" + (k + 1) : "!x" + (k+1);
	}
	for(i = 0; i < variables.topSide.length; i++){
		res2 += parseInt(variables.topSide[i]) ? "x" + (i+ k + 1) : "!x" + (i+k+1);
	}
	return res1 +" "+ res2;
}

function copyPartMap(current, KMap){
	// var a = contour.height == KMap.Height?
	var cellsInContours = [];
	for(i = 0; i < current.height; i++){
		let temp = KMap[current.x + i].slice(current.y,current.width + current.y);
		console.log("expr part", temp);
		cellsInContours.push(temp[0]);
	}
	return cellsInContours;
}