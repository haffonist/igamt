/**
 * Created by haffo on 1/12/15.
 */


angular.module('igl')
    .controller('ProfileListCtrl', function ($scope, $rootScope, Restangular) {
        $scope.customs = [];
        $scope.preloadeds = [];
        $scope.tmpPreloadeds = [];
        $scope.tmpCustoms = [];
        $scope.error = null;
        $scope.user = {id: 2};
        // step: 0; list of profile
        // step 1: edit profile


        /**
         * init the controller
         */
        $scope.init = function () {
            $scope.preloadeds = Restangular.all('profiles/preloaded').getList().$object;
            $scope.customs = Restangular.all('profiles').getList({userId:$scope.user.id}).$object;
         };

        $scope.clone = function (profile) {
            $scope.settings.step = 0;
            Restangular.all('profiles').post({targetId: profile.id}).then(function(profile) {
                $scope.customs.push(profile);
            },function(error){
                $scope.error = error;
            });
        };

        $scope.edit = function (profile) {
            Restangular.one('profiles',profile.id).get().then(function(profile) {
                $scope.settings.step = 1;
                $rootScope.profile = profile;
                $rootScope.backUp = Restangular.copy($rootScope.profile);
            },function(error){
                $scope.error = error;
            });
        };


        $scope.delete = function (profile) {
            profile.remove().then(function () {
                var index = $scope.customs.indexOf(profile);
                if (index > -1) $scope.customs.splice(index, 1);
            }, function(error){
                $scope.error = error;
            });
        };


    });


angular.module('igl')
    .controller('EditProfileCtrl', function ($scope, $rootScope, Restangular) {

        $scope.changes = [];
        $scope.error = null;

        /**
         * init the controller
         */
        $scope.init = function () {
        };

        $scope.cancel = function(){
            $scope.settings.step = 0;
            $scope.changes = [];
            $rootScope.profile =null;
        };

        $scope.delete = function () {
            $rootScope.profile.remove().then(function () {
                $scope.settings.step = 0;
                var index = $scope.customs.indexOf( $rootScope.profile);
                if (index > -1) $scope.customs.splice(index, 1);
                $rootScope.backUp = null;
            }, function(error){
                $scope.error = error;
            });
        };

        $scope.applyChanges = function () {

        };
    });

