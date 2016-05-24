require('angular');

angular.module('liskApp').controller('diceController', ['$state','$scope', '$rootScope', '$http', "userService", "$interval", "$timeout", "sendTransactionModal", "secondPassphraseModal", "delegateService", 'viewFactory', 'transactionInfo', 'userInfo', '$filter', 'gettextCatalog', function ($state, $rootScope, $scope, $http, userService, $interval, $timeout, sendTransactionModal, secondPassphraseModal, delegateService, viewFactory, transactionInfo, userInfo, $filter, gettextCatalog) {
    $scope.view = viewFactory;
    $scope.view.inLoading = true;
    $scope.view.loadingText = gettextCatalog.getString('Loading dashboard');
    $scope.view.page = {title: gettextCatalog.getString('Dashboard'), previous: null};
    $scope.view.bar = {};
    $scope.delegate = undefined;
    $scope.address = userService.address;
    $scope.publicKey = userService.publicKey;
    $scope.balance = userService.balance;
    $scope.unconfirmedBalance = userService.unconfirmedBalance;
    $scope.secondPassphrase = userService.secondPassphrase;
    $scope.unconfirmedPassphrase = userService.unconfirmedPassphrase;
    $scope.transactionsLoading = true;

    $scope.updateAppView = function () {
        $http.get("/api/blocks/getHeight", {params: {address: $scope.onlyMine?userService.address:null}}).then(function(heightResp){
            $http.get("/api/dices/list", {params: {address: $scope.onlyMine?userService.address:null}})
                    .then(function (resp) {
                        $scope.currentHeight = heightResp.data.height;
                        $scope.view.inLoading = false;
                        var dices = resp.data.dices;
                        dices.forEach(function(tx){
                            var dice = tx.asset.dice;
                            var times = (parseInt(dice.payout)/parseInt(dice.amount));
                            var chanceToWin = 99/times;
                            dice.lowerThan = chanceToWin*10000;
                            dice.higherThan = (100- chanceToWin)*10000-1;
            //                dice.submitting = $scope.rolls.filter(function(roll) {return tx.id==roll.id}).length>0;
                        });
                        $scope.rolls.filter(function(roll){
                            return dices.filter(function(tx) {
                                return tx.id == roll.id;
                            }).length<=0;
                        }).forEach(function(submittingRoll) {
                            dices.unshift(submittingRoll);
                        })
                        $scope.dices = dices;
                    });
        });
    }
    $scope.rollAmountChanged = function(amount) {
        $scope.roll.payout = amount * $scope.roll.x;
    }
    $scope.rollPayoutChanged = function(payout) {
        $scope.roll.x = payout / $scope.roll.amount;
    }
    $scope.changeAmountBy = function(by) {
        $scope.roll.amount*=by;
        
        $scope.rollAmountChanged($scope.roll.amount);
    }

    $scope.rolls = [];
    $scope.roll = {
        amount: 1000,
        payout: 2000,
        x: 2
    }
    $scope.times = 2;
    $scope.onlyMine = false;
    $scope.allOrMine = function(){
        $scope.onlyMine = !$scope.onlyMine;
        $scope.updateAppView();
    }
    $scope.rollIt = function(high){
        var body = {"dice": {"amount":$scope.roll.amount*100000000,"payout":$scope.roll.payout*100000000, "rollHigh":high?1:0},"secret": userService.rememberedPassphrase};
        $http.put('/api/dices/add', body).then(function(res){
            var d = new Date(Date.UTC(2015, 3, 9, 0, 0, 0, 0));
            var t = parseInt(d.getTime() / 1000);
            
            $scope.rolls.push({senderId:userService.address, asset:body, id: res.data.id, timestamp: new Date().getTime()/1000 - t});
            $scope.updateAppView();
        });
    }
    // $scope.$on('updateControllerData', function (event, data) {
    //     if (data.indexOf('main.dashboard') != -1 && $state.current.name=="main.dashboard") {
    //         $scope.updateAppView();
    //     }
    // });
    var interval = $interval(function(){
        $scope.updateAppView();
    }, 5000);
    $scope.$on('$destroy', function(){
        $interval.cancel(interval);
    })
    $scope.updateAppView();

}]).filter('luckyNumberFilter', function() {
    return function(number) {
        return parseInt(number)/10000;
        
    }
}).filter('chanceFilter', function() {
      return function(chance) {
          return (chance/10000).toFixed(4) ;
          
      }
  });
