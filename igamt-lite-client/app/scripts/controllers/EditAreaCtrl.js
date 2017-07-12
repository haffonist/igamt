angular.module('igl')
    .controller('EditAreaCtrl', function ($scope, $rootScope, CloneDeleteSvc,SectionSvc,ElementUtils) {

        $scope.init = function() {
            if ($scope.editForm) {
                $rootScope.clearChanges();
                $scope.editForm.$setPristine();
                $scope.editForm.$dirty = false;
                console.log("=====> set $dirty to false")
            }
        };

        $scope.confLengthPattern= '[1-9]\\d*[#=]{0,1}';

        $rootScope.$on("event:initEditArea", function (event) {

            $scope.init();
        });

        $scope.$watch(
            function() {
                return $scope.editForm != undefined && $scope.editForm.$dirty;
            },
            function handleFormState(newValue) {
                if (newValue) {
                    $rootScope.recordChanged();
                } else {
                    $rootScope.clearChanges();
                }
            }
        );


        $scope.setDirty = function() {
            console.log("Called ============")
            $scope.editForm.$dirty = true;
        };

        $scope.setUsage = function(node) {
            ElementUtils.setUsage(node);
            $scope.setDirty();
        };
        $scope.clearDirty = function() {
            if ($scope.editForm) {
                $scope.editForm.$setPristine();
                $scope.editForm.$dirty = false;
            }
        };


        $scope.openRichTextDlg = function (obj, key, title, disabled) {
            var original = obj[key];
            var modalInstance = $rootScope.openRichTextDlg(obj, key, title, disabled);
            modalInstance.then(function () {
                if(!disabled && original !== obj[key]){
                    $scope.setDirty();
                }
            }, function () {
                if(!disabled && original !== obj[key]){
                    $scope.setDirty();
                }
            });
        };

        $scope.openInputTextDlg = function (obj, key, title, disabled) {
            var original = obj[key];
            var modalInstance = $rootScope.openInputTextDlg(obj, key, title, disabled);
            modalInstance.then(function () {
                if(!disabled && original !== obj[key]){
                    $scope.setDirty();
                }
            }, function () {
                if(!disabled && original !== obj[key]){
                    $scope.setDirty();
                }
            });
        };

        $scope.clearComments = function (obj, key) {
            obj[key] = '';
            $scope.setDirty();
        };

        $scope.editLength = function(node){
            node.confLength = "NA";
            node.minLength = "";
            node.maxLength = "";
            $scope.setDirty();
        };

        $scope.editConfLength = function(node){
            node.confLength = "";
            node.minLength = "NA";
            node.maxLength = "NA";
            $scope.setDirty();
        };

        $scope.clearConfLength = function(node){
            node.confLength = "NA";
            $scope.setDirty();
        };

        $scope.clearLength = function(node){
            node.minLength = "NA";
            node.maxLength = "NA";
            $scope.setDirty();
        };



    });
