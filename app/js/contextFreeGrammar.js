//выбор 'случайного' правила из массива
Array.prototype.choice = function() {
  var i = Math.floor(Math.random() * this.length);
  return this[i];
}

//Грамматика с пустым объектом правил
function ContextFree() {
  this.rules = {};
}

// Правила хранятся в ассоциативном массиве, где продукции представлены в массиве
ContextFree.prototype.addRule = function(rule, expansion) {
  if (this.rules.hasOwnProperty(rule)) {  //если правило с таким нетерминалом уже есть
    this.rules[rule].push(expansion);
  } else {
    this.rules[rule] = [expansion];
  }
}

// Рекурсивно вызывает себя, пока не достигнет терминала
ContextFree.prototype.expand = function(start, expression) {
  if (this.rules.hasOwnProperty(start)) {
    // Выбираем продукции по заданному нетерминалу
    var products = this.rules[start];
    var picked = products.choice();

    for (var i = 0; i < picked.length; i++) {
      this.expand(picked[i], expression);
    }
  } else {
    expression.push(start);
  }
}

ContextFree.prototype.getExpression = function(axiom) {
   var expression = [];
  this.expand(axiom, expression);
  // возвращаем строку
  return expression.join(' ');
}
