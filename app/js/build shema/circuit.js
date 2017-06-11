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

function Node(){
	this.typeOp = '';
	this.input1 = null;
	this.input2 = null;
}

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
	
	// getOut: function(){
	// 	if(hasNumbers(this.typeOp))
	// 		return false;
	// 	else{
	// 		return eval(getOut(this.input1) + this.typeOp + getOut(this.input2));
	// 	}
	// 	// if(gate.input1.includes('x') || gate.input2.includes('x'))
	// 	// 	return gate;
	// 	// return eval(getOut(gate.input1) + gate.typeOp + getOut(gate.input2));
	// 	// return 666;
	// }
}

function getOutput(gate){
	//рекурсивно вычислить значения левого и правого 
	return eval(gate.input1 + gate.typeOp + gate.input2);
}
