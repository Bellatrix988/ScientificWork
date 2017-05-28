mocha.setup('bdd');
var assert = chai.assert;

describe("test", function() {
	console.log(getMinFormulaFrom(2,'( x1 ) && x2 || ( x1 || x2 && ( x1 ) ) && x2'));
  it("находит минимальную форму", function() {
    assert.equal(
    	getMinFormulaFrom(2,'( x1 ) && x2 || ( x1 || x2 && ( x1 ) ) && x2')[0].value,
    	"x1x2"
    	);
  });

});


mocha.run();