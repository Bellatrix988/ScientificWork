var User = function(name, level){
	this.name = name;
	this.level = level;
}

User.prototype.incLevel = function(){
    var lvl = this.level + 1;
    dataBase.transaction(function (tx) {
            tx.executeSql("UPDATE dbUser SET level = ? where id = ?", [lvl, 1]);
        });
    this.level = lvl;
}
var arrayH = [];
var dataBase = {};
//window.onload = function () {
	initDB = function () {

	        openDB();
	        createTable();
	        selectWrite();

	};
    openDB = function () {
        dataBase = openDatabase('dbUser', '1.0', 'DataBase of User', 1024 * 1024 * 5);
        if (!dataBase) { alert("Failed to connect to database."); }
    };
    createTable = function () {
        dataBase.transaction(function (tx) {
            tx.executeSql("CREATE TABLE IF NOT EXISTS dbUser (id integer primary key, name TEXT , level INTEGER)", []);
    		tx.executeSql("INSERT INTO dbUser (id, name, level) VALUES (?,?,?)", [1,"Genius","1"], null,null);
            // tx.executeSql("IF NOT EXISTS(SELECT * FROM dbUser WHERE name = ?) INSERT INTO dbUser (name, level) VALUES (?,?)", ["Genius","Genius","0"], null,null);
        });
    };

    selectWrite = function () {
    	// dataBase.transaction(function (tx) {
     //            tx.executeSql("DELETE FROM dbUser");
     //            tx.executeSql("DROP TABLE dbUser");

     //    })

     	funcError = function(){
     		dataBase.transaction(function (tx) {
	    		tx.executeSql("INSERT INTO dbUser (name, level) VALUES (?,?)", ["Genius","1"], null,null);
			});
     	}
        dataBase.transaction(function (tx) {
            tx.executeSql("SELECT * FROM dbUser", [], function (tx, result) {
               for (var i = 0; i < result.rows.length; i++) {
                    arrayH.push(new User(result.rows.item(i)['name'], result.rows.item(i)['level']));
                }
                    // console.log("length arrayH " + arrayH.length);
            		// console.log(result.rows.length);
            		loadUser();
            }); 
        });
    };

var userInfoApp = angular.module("userInfoApp", []);

userInfoApp.directive('popUpMsg', function(){
  return {
    restrict: 'E',
    scope: false,
    template: '<div id="popUpMsg-bg" ng-show="showPopUpMsg"><div id="popUpMsg"><div class="close" ng-click="closePopUp()">x</div><div class="content"><input type="text" ng-model="newName"></div><button type="submit" ng-click="updateName(newName); closePopUp()">Изменить</button></div></div>',
    controller: function($scope) {
      $scope.closePopUp = function(){
        $scope.showPopUpMsg = false;
      }
    }
  }
})

userInfoApp.controller("infoCtrl",function($scope){
    $scope.showPopUpMsg = false;
    $scope.openPopUp = function() {
        $scope.showPopUpMsg = true;
    }
	$scope.userInfo = {};
    $scope.updateName = function (name) {
        dataBase.transaction(function (tx) {
            tx.executeSql("UPDATE dbUser SET name = ? where id = ?", [name, 1]);
        });
        $scope.userInfo.name = name;
    };

    $scope.updateLevel = function (lvl) {
        dataBase.transaction(function (tx) {
            tx.executeSql("UPDATE dbUser SET level = ? where id = ?", [lvl, 1]);
        });
        $scope.userInfo.level = lvl;
    };

    loadUser = function () {
        $scope.$apply(function () {
            $scope.userInfo = arrayH[0];
            // console.log("Watch");
        });
    };

});

