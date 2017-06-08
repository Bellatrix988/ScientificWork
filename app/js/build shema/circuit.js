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

function Gate(){
	this._root = null;
}

Gate.prototype = {
	constructor: Gate,
	addVariable: function(n){
		var node = {
			typeOp: n,
			input1: null,
			input2: null
		};
		this._root = node;
	},
	add: function(typeOp){
		var node = {
			typeOp: typeOp,
			input1: new Gate(),
			input2: new Gate()
		};
		this._root = node;
	},
	updateTypeOp: function(typeOp){
		if(this._root.typeOp != null)
			this._root.typeOp = typeOp;
	},
	addRuleObj: function(typeOp, in1, in2){
		this._root.typeOp = typeOp;
		this._root.input1.add(in1);
		this._root.input2.add(in2);
	},
	getOut: function(gate, args){
		// if(gate.input1.includes('x') || gate.input2.includes('x'))
		// 	return gate;
		// return eval(getOut(gate.input1) + gate.typeOp + getOut(gate.input2));
		return 666;
	}
}

function getOutput(gate){
	//рекурсивно вычислить значения левого и правого 
	return eval(gate.input1 + gate.typeOp + gate.input2);
}

var svgGate = angular.module('svgGate', []);

	svgGate.controller('viewGate', AppCtrl);
	svgGate.directive('item', function($compile) {
    	return {
			restrict: 'E',
			replace: true,
			scope: {
				itemType: '<',
			},
			template: '<g></g>',
			templateNamespace: 'svg',

			link: function($scope, element, attrs) {
	            $scope.$watch('itemType', function(newType) {	
	            	var itemHtml;
	            	if (newType === 'rect') {
	            		itemHtml = '<rect x="5" y="5" rx="20" ry="20" width="150" height="150" style="fill:red;stroke:black;stroke-width:5;opacity:0.5"></rect>';
	            	} else {
	            		itemHtml = '<circle cx="80" cy="80" r="75" style="stroke:black;stroke-width:5;fill:red;opacity:0.5" />';
	            	}             
                    element.html(itemHtml);
                    $compile(element.contents())($scope);		                 		                
	            });
	        }
	    }
	});
	function AppCtrl() {
		this.template = 'rect';
	}