//выбор 'случайного' правила из массива
// Array.prototype.choice = function() {
//   var i = Math.floor(Math.random() * this.length);
//   return this[i];
// }

Array.prototype.choiceRandom = function() {
  var i = Math.floor(Math.random() * this.length);
  // var i = Math.floor(this.length / 2);
  return this[i];
};

// Array.prototype.max = function() {
//   return Math.max.apply(null, this);
// };

Array.prototype.choice = function(){
  var tempSort = this;
  //фильтруем, чтобы не уйти в отрицательную вероятность
  this.filter(function(item){
      let keys = Object.keys(item);
      return item > 0.1;
  });

  //отсортировали так, что от большего к меньшему
  tempSort.sort(function(e1,e2){
    var m = Object.keys(e1);
    var n = Object.keys(e2);
    return (m[0] < n[0]);
  });

  //сначала берем первый элемент - с самой большой вероятностью
  var current = tempSort[0];
  //вычисляем его ключ и значение
  var curKey = Object.keys(current);
  var curVal = Object.values(current)[0];
  var result = curVal.choiceRandom();

  //если у данной вероятности нескольо переходов,
  // то уменьшаем вероятность выбранного объекта
  if(curVal.length > 0)
  {
    var deleted = curVal.splice(curVal.indexOf(result),1);
    addNodeinRules(this, curKey-0.1, deleted[0]); 
    if (curVal.length == 0)
      this.splice(this.indexOf(current),1);
  } 

  return result;

  //использование всех возможных перменных
}

//Грамматика с пустым объектом правил
function ContextFree() {
  this.rules = {};
};

var Expression = function(){
};

Expression.prototype.addNode = function(w,e){
  if(Object.keys(this).indexOf(w) !== -1)
    this[w].push(e);
  else
    this[w] = [e];
}

//Добавляет выражение в массив parentObj
addNodeinRules = function(parentObj, weight, expansion){
      var flag = false;
      var expr, ind;
      parentObj.forEach(function(exprs, i){
          for(var e in exprs)
            flag = flag || (e == weight);
          //если в массиве имеется объект с весом weight
          if(flag) {
           ind = i;
           expr = exprs;
           return;
         }
      });
      //если не нашли такого объекта
      if(expr === undefined)
        var expr = new Expression();
      //добавляем данные
      expr.addNode(weight, expansion);
      //если объект найден, то изменяем содержимое, иначе добавляем
      if(ind !== undefined)
        parentObj[ind] = expr;
      else
        parentObj.push(expr);
}

//добавление правила
ContextFree.prototype.addRule = function(rule, expansion, weight) {
  if (this.rules.hasOwnProperty(rule)) {  //если правило с таким нетерминалом уже есть
    addNodeinRules(this.rules[rule],weight, expansion);
  } else {
    var expr = new Expression();
    expr.addNode(weight, expansion);
    this.rules[rule] = [expr];
  }
}

// Правила хранятся в ассоциативном массиве, где продукции представлены в массиве
// ContextFree.prototype.addRule = function(rule, expansion) {
//   if (this.rules.hasOwnProperty(rule)) {  //если правило с таким нетерминалом уже есть
//     this.rules[rule].push(expansion);
//   } else {
//     this.rules[rule] = [expansion];
//   }
// }

// Рекурсивно вызывает себя, пока не достигнет терминала
ContextFree.prototype.expand = function(start, expression, tree) {
  if (this.rules.hasOwnProperty(start)) { 
    // Выбираем продукции по заданному нетерминалу
    var products = this.rules[start];
    var picked = products.choice();

    if(tree != undefined && tree.typeOp == start){
      if(picked.length == 3)
        tree.addRuleObj(picked[1],picked[0],picked[2]); 
      if(picked.length == 1)
          tree.updateTypeOp(picked[0]);
     }

    for (var i = 0; i < picked.length; i++) {
      if(tree == undefined)
        this.expand(picked[i], expression);
      else{
        if(picked.length == 3 && i == 0)
          this.expand(picked[i], expression, tree.input1);
        else if(picked.length == 3 && i == 2)
          this.expand(picked[i], expression, tree.input2);
        else
          this.expand(picked[i], expression, tree);
        }
    }
  } else { 
    expression.push(start);
  }
}

ContextFree.prototype.getExpression = function(axiom, tree) {
  var expression = [];
  if(tree == undefined)
    this.expand(axiom, expression);
  else{
    tree.add(axiom);
    this.expand(axiom, expression, tree);
    // console.log('Res tree:', tree.getLayer1(0), tree.getLayer2(0));
  }
    // возвращаем строку
    return expression.join(' ');
}
