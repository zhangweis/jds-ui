require('angular');

angular.module('liskApp').controller('settingsController', ['$scope', '$rootScope', '$http', "userService", "$interval", "multisignatureModal", 'gettextCatalog', function ($rootScope, $scope, $http, userService, $interval, multisignatureModal, gettextCatalog) {

    var setPage = function () {
        $scope.view.page = {title: gettextCatalog.getString('Settings'), previous: null};
    }

    // Refresh $scope.view.page object on change of language.
    $rootScope.$on('gettextLanguageChanged', setPage);
    // Set $scope.view.page at runtime.
    setPage();

    $scope.view.bar = {};

    $scope.settings = {
        user: userService,
        enabledMultisign: false
    }

    $scope.checkEnabledMultisign = function () {
        if (userService.multisignatures && userService.multisignatures.length) {
            return true;
        } else if (userService.u_multisignatures && userService.u_multisignatures.length) {
            return true;
        } else {
            return false;
        }
    }

    $scope.settings.enabledMultisign = $scope.checkEnabledMultisign();

    $scope.updateSettings = $interval(function () {
        $scope.settings.enabledMultisign = $scope.checkEnabledMultisign();
    }, 1000);

    $scope.setMultisignature = function () {
        if ($scope.checkEnabledMultisign()) {
            return;
        } else {
            $scope.settings.enabledMultisign = true;
        }
        $interval.cancel($scope.updateSettings);
        $scope.multisignatureModal = multisignatureModal.activate({
            destroy: function (enabled) {
                $scope.settings.enabledMultisign = enabled;
                $scope.settings.updateSettings = $interval(function () {
                    $scope.enabledMultisign = $scope.checkEnabledMultisign();
                }, 1000);
            }
        });
    }

}]);
