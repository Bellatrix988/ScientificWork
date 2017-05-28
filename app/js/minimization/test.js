mocha.setup('bdd');
var assert = chai.assert;

describe("test", function() {
	console.log(getMinFormulaFrom(2,'( x1 ) && x2 || ( x1 || x2 && ( x1 ) ) && x2'));
  it("находит минимальную форму", function() {
    assert.equal(
    	getMinFormulaFrom(2,'( x1 ) && x2 || ( x1 || x2 && ( x1 ) ) && x2'),
    	"x1x2"
    	);
    assert.equal(
    	getMinFormulaFrom(3,'x1 && x2 || x3 && (x1 || x2 && x3)'),
    	"x1x3 || x1x2 || x2x3"
    	);
    assert.equal(
    	getMinFormulaFrom(4,'!x1 && !x2 && x3 && x4 || !x1 && x2 && !x3 && x4 || !x1 && x2 && x3 && x4 || x1 && x2 && x3 && x4'),
    	"!x1x2x4 || !x1x3x4 || x2x3x4"
    	);
    assert.equal(
    	getMinFormulaFrom(3,'!x1 && x2 && !x3 || !x1 && x2 && x3 || x1 && !x2 && !x3 || x1 && x2 && !x3 || x1 && x2 && x3'),
    	"x2 || x1!x3"
    	);
  });


});

mocha.run();