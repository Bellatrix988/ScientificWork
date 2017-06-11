// function ConverterOperations(op){
// 	switch(op){
// 		case 'and':
// 			return '&&';
// 			break;
// 		case 'or':
// 			return '||';
// 			break;
// 		case 'xor':
// 			return '^'
// 			break;

// 	}
// }

//Объект 
var gate = {
	typeOp: '',
	input1: null,
	input2: null
};

//Узел - объект дерева выражения
function Node(){
	this.typeOp = '';
	this.input1 = null;
	this.input2 = null;
}

//Методы для добавления нового узла операции или переменной
Node.prototype = {
	constructor: Node,
	addVariable: function(n){
		this.typeOp = n;
	},
	add: function(typeOp){
		this.typeOp = typeOp;
		this.input1 = new Node();
		this.input2 = new Node();
	},
	updateTypeOp: function(typeOp){
		if(this.typeOp != null)
			this.typeOp = typeOp;
	},
	addRuleObj: function(typeOp, in1, in2){
		this.typeOp = typeOp;
		this.input1.add(in1);
		this.input2.add(in2);
	},
	getLayer1: function(n){
		if(this.input1 == null)
			return n;
		while(this.input1 != null){
			return this.input1.getLayer1(n+1);
		}
	},
	getLayer2: function(n){
		if(this.input2 == null)
			return n;
		while(this.input2 != null){
			return this.input2.getLayer2(n+1);
		}
	},
	getLayer: function(n){
		return Math.min(this.getLayer1(n),this.getLayer2(n));
	}
}

//Объект - наследник Node, с полями, необходимыми для отображения
function GateUI(){
    Node.apply(this, arguments);
    this.position = [0.0, 0.0];
    this.id = -1;
    this.value = false; //this.getOut();
    this.color = this.value ? "green" : "orange"; //or orange
    this.layer = 0;
    this.layerCount = -1; //используется для отслеживания кол-ва узлов на одном уровне
}

//методы

GateUI.prototype = Object.create(Node.prototype);

GateUI.prototype.constructor = GateUI;
GateUI.prototype.add = function(typeOp){
    this.typeOp = typeOp;
    this.input1 = new GateUI();
    this.input2 = new GateUI();
}
// GateUI.prototype.getOut = function(){
//     if(hasNumbers(this.typeOp))
//         return false;
//     else{
//         return eval(this.input1.getOut() + this.typeOp + this.input2.getOut());
//     }
// }

//Находит среди всего объекта(включая потомки) элемент по id. 
//Если не найдено - undefined
GateUI.prototype.getById = function(id){
    if(this != null){
        if(hasNumbers(this.typeOp))
            return this.id == id? this : undefined;
        else{
            this.input1.getById(id);
            this.input2.getById(id);
        }
    }else
    return undefined;
}

//Переопределение метода добавления переменной с учетом новых полей
GateUI.prototype.addVariable = function(nameVariable){
    Node.prototype.addVariable.apply(this, arguments);
    this.id = nameVariable;
}

//Переопределяет Node в GateUI, инициализируя новые поля
GateUI.prototype.overrideOvj = function(obj){
    if(obj == null)
        return;
    if(obj.typeOp != ''){
        if(hasNumbers(obj.typeOp))
            this.addVariable(obj.typeOp);
        else
            this.add(obj.typeOp);
    } else
        return;

    while(this.input1 != null && this.input2 != null){
        this.input1.overrideOvj(obj.input1);
        this.input2.overrideOvj(obj.input2);
        return;
    }
}

//Объект-обертка выходного значения
//За место 2-х input имеет один
function outCell(obj){
    this.input = obj;
    this.position = [0,0];
    this.id = 'out';
    this.value = false;
    this.color = this.value ? "green" : "orange"; //or orange
    this.layer = -1;
    this.layerCount = 1;
}

//Вспомогательные функции

//объявим внешние переменные, необходимые далее
var nodesTree = [];
var id = 0;
var maxLevel = -1;

//инициализация выходного массива 
function initTreeNodes(tree){
    id = 0; //уникальный id для операции
    maxLevel = tree.getLayer(id);  //необходимо для вычисления уровня переменных 
    nodesTree = new Array();    //результирующий массив для вывода

    let node = new GateUI();
    node.overrideOvj(tree); //переопредляем полученное дерево в GateUI
    node = new outCell(node);   //оборачиваем объект выходным объектом
    nodesTree.push(node);   

    return initArrayNodes(node.input,0);
}

//обходим полученное дерево выражений и инициализируем его поля для корректного вывода
function initArrayNodes(tree, layer){
    var current = tree;
    while(current != null) //условие для выхода из рекурсии
    {
        if(hasNumbers(current.typeOp)){   //если объект - переменная
            current.id = current.typeOp;
            current.layer = maxLevel;   //все перменные располагаются на одном уровне

        } else{
            current.id = id++;
            current.layer = layer;
        }

        //обновляем сведения о кол-ве узлов на слое
        current.layerCount = filterByLayer(nodesTree, current.layer).length; 

        //проверка, чтобы не было одинаковых элементов
        if(!containsObject(current,nodesTree))  
             nodesTree.push(current);
        //рекурсивный вызов для левого и правого потомка
        initArrayNodes(current.input1,layer + 1);
        initArrayNodes(current.input2,layer + 1);
        return nodesTree;
    }
}

//Фильтрует массив arr, оставляя элементы заданного уровня
function filterByLayer(arr,layer) {
    return arr.filter(function(obj){
       return  obj.layer == layer;
    });
}

//Возвращает элемент из массива по id
function getElemByID(list, id){
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
            return list[i];
        }
    }
}

//Проверяет, содержит ли массив заданный объект(проверка по id)
function containsObject(obj, list) {
    return getElemByID(list, obj.id) != undefined;
    // for (var i = 0; i < list.length; i++) {
    //     if (list[i].id === obj.id) {
    //         return true;
    //     }
    // }
    // return false;
}

//Проверяет, содержит ли заданная строка в себе число
function hasNumbers(t){
  var regex = /\d/g;
  return regex.test(t);
}

