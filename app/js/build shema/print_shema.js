function GateUI(){
    Node.apply(this, arguments);
    this.position = [0.0, 0.0];
    this.id = -1;
    this.value = false; //this.getOut();
    this.color = this.value ? "green" : "orange"; //or orange
    this.text = '';
    this.layer = 0;
    this.layerCount = -1;
}


GateUI.prototype = Object.create(Node.prototype);

GateUI.prototype.constructor = GateUI;
GateUI.prototype.add = function(typeOp){
    this.typeOp = typeOp;
    this.input1 = new GateUI();
    this.input2 = new GateUI();
}
GateUI.prototype.getOut = function(){
    if(hasNumbers(this.typeOp))
        return false;
    else{
        return eval(this.input1.getOut() + this.typeOp + this.input2.getOut());
    }
    }
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

GateUI.prototype.addVariable = function(nameVariable){
    Node.prototype.addVariable.apply(this, arguments);
    this.id = nameVariable;
}

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

function outCell(obj){
    // GateUI.apply(this, arguments);
    this.input = obj;
    this.position = [0,0];
    this.position[0] = obj.position[0];
    this.position[1] = obj.position[1] - 50;
    // this.position = this.input.position;
    // this.position[0] +=50;
    this.id = 'out';
    this.value = obj.value;
    this.color = this.value ? "green" : "orange"; //or orange
    this.layer = -1;
    this.layerCount = 1;
}

// outCell.prototype = Object.create(GateUI.prototype);
// outCell.prototype.constructor = outCell;

function filterByLayer(arr,layer) {
    return arr.filter(function(obj){
       return  obj.layer == layer;
    });
  // if (obj.layer == layer) {
  //   return true;
  // } else {
  //   return false;
  // }
}


function containsObject(obj, list) {
    // list.forEach(function(item, ind){
    //     item.forEach(function(elem){
    //         if(elem.id == obj.id)
    //             return ind;
    //     });
    // });
    // return -1;  
    for (var i = 0; i < list.length; i++) {
        if (list[i].id === obj.id) {
            return true;
        }
    }

    return false;
}
var nodesTree = [];
var id = 0;
var maxLevel = -1;
function initTreeNodes(tree){
    id = 0;
    maxLevel = tree.getLayer(id);
    nodesTree = new Array();
    let node = new GateUI();
    node.overrideOvj(tree);
    node = new outCell(node);
    nodesTree.push(node);
    return initArrayNodes(node.input,0);
}

function initArrayNodes(tree, layer){
    var current = tree;
    while(current != null) //current.input2 != null && current.input1 != null
    {
        // if(nodesTree[layer] == null)
        //     nodesTree[layer] = new Array();
        if(hasNumbers(current.typeOp)){   //is variable ?
            current.id = current.typeOp;
            current.layer = maxLevel;

        } else{
            current.id = id;
            id++;
            current.text = current.typeOp;
            current.layer = layer;
        }
        let filterTree = filterByLayer(nodesTree, current.layer);
        console.log('filterTree',filterTree, layer);
        current.layerCount = filterTree.length;
        if(!containsObject(current,nodesTree))
             nodesTree.push(current);

        // let indV = containsObject(current,nodesTree);
        // if( indV == -1)
        //     nodesTree[layer].push(current);
        // else
        //     nodesTree[indV].push(current);
        initArrayNodes(current.input1,layer + 1);
        initArrayNodes(current.input2,layer + 1);
        return nodesTree;
    }
}

var svgGate = angular.module('svgGate', []);

svgGate.controller('viewGate', function($scope){
    var fieldBorder = 20;
   $scope.computeScale = function(x) {
            return x * $scope.fieldScale + fieldBorder;
        }

    $scope.computePosition = function(x) {
            return x * $scope.fieldScale + fieldBorder;
    }
})
