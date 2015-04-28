/**
 * Created by haffo on 1/12/15.
 */


angular.module('igl')
    .controller('ProfileListCtrl', function ($scope, $rootScope, Restangular, $http, $filter, userInfoService, $modal, $cookies) {
        $scope.loading = false;
        $scope.tmpPreloadedIgs = [].concat($rootScope.preloadedIgs);
        $scope.tmpCustomIgs = [].concat($rootScope.customIgs);
        $scope.error = null;
        $scope.preloadedLoading = false;
        $scope.customLoading = false;
//        $scope.preLoadedError = null;
//        $scope.customError = null;
        // step: 0; list of profile
        // step 1: edit profile


        /**
         * init the controller
         */
        $scope.init = function () {
//            $rootScope.context.page = $rootScope.pages[0];
//            $rootScope.selectIgTab(0);
//            $scope.preloadedError = null;
//            $scope.customError = null;

            $scope.loadProfiles();

            /**
             * On 'event:loginConfirmed', resend all the 401 requests.
             */
            $scope.$on('event:loginConfirmed', function () {
                $scope.loadProfiles();
            });


        };

        $scope.loadProfiles = function () {
            if (userInfoService.isAuthenticated()) {
                $scope.preloadedLoading = true;
                $http.get('api/profiles', {timeout: 60000}).then(function (response) {
                    $rootScope.preloadedIgs = angular.fromJson(response.data);
                    $scope.preloadedLoading = false;
                }, function (error) {
//                    $scope.preLoadedError = error;
                    $scope.preloadedLoading = false;
                });
                $scope.customLoading = true;
                $http.get('api/profiles/cuser', {timeout: 60000}).then(function (response) {
                    $rootScope.customIgs = angular.fromJson(response.data);
                    $scope.customLoading = false;
                }, function (error) {
//                    $scope.customError = error;
                    $scope.customLoading = false;
                });
            }
        };

        $scope.clone = function (id) {
            waitingDialog.show('Cloning profile...', {dialogSize: 'sm', progressType: 'info'});
            $http.post('api/profiles/' + id + '/clone', {timeout: 60000}).then(function (response) {
                $rootScope.customIgs.push(angular.fromJson(response.data));
                waitingDialog.hide();
            }, function (error) {
                 waitingDialog.hide();
            });
        };

        $scope.findOne = function (id) {
            for (var i = 0; i < $rootScope.customIgs.length; i++) {
                if ($rootScope.customIgs[i].id === id) {
                    return  $rootScope.customIgs[i];
                }
            }
            return null;
        };

        $scope.edit = function (id) {
            try{
                waitingDialog.show('Loading profile...', {dialogSize: 'sm', progressType: 'info'});
                $scope.openProfile($scope.findOne(id));
                waitingDialog.hide();
            }catch (e){
                $scope.loading = true;
                waitingDialog.hide();
                $rootScope.msg().text = "igInitFailed";
                $rootScope.msg().type = "danger";
                $rootScope.msg().show = true;
            }
        };

        $scope.openProfile = function (profile) {
                 $scope.loading = true;
                if (profile != null) {
                    $rootScope.initMaps();
//                $rootScope.context.page = $rootScope.pages[1];
                    $rootScope.selectIgTab(1);
                    $rootScope.profile = profile;
                    $rootScope.messages = $rootScope.profile.messages.children;
                    angular.forEach($rootScope.profile.datatypes.children, function (child) {
                        this[child.id] = child;
                    }, $rootScope.datatypesMap);
                    angular.forEach($rootScope.profile.segments.children, function (child) {
                        this[child.id] = child;
                    }, $rootScope.segmentsMap);

                    angular.forEach($rootScope.profile.tables.children, function (child) {
                        this[child.id] = child;
                    }, $rootScope.tablesMap);


                    $rootScope.segments = [];
                    $rootScope.tables = $rootScope.profile.tables.children;
                    $rootScope.datatypes = $rootScope.profile.datatypes.children;

                    angular.forEach($rootScope.profile.messages.children, function (child) {
                        this[child.id] = child;
                        angular.forEach(child.children, function (segmentRefOrGroup) {
                            $rootScope.processElement(segmentRefOrGroup);
                        });
                    }, $rootScope.messagesMap);


                    if ($rootScope.profile.messages.children.length === 1) {
                        $rootScope.message = $rootScope.messages[0];
                        $rootScope.message.children = $filter('orderBy')($rootScope.message.children, 'position');
                        angular.forEach($rootScope.message.children, function (segmentRefOrGroup) {
                            $rootScope.processElement(segmentRefOrGroup);
                        });
                        $rootScope.notifyMsgTreeUpdate = new Date().getTime();
                        $rootScope.segment = $rootScope.segments[0];
                        $rootScope.segment["type"] = "segment";
                        $rootScope.notifySegTreeUpdate = new Date().getTime();
                    }

                    angular.forEach($rootScope.profile.messages.children, function (message) {
                        var segRefOrGroups = [];
                        var segments = [];
                        var datatypes = [];
                        $scope.collectData(message, segRefOrGroups, segments, datatypes);
                        $rootScope.messagesData.push({message: message, segRefOrGroups: segRefOrGroups, segments: segments, datatypes: datatypes});
                    });

                    $scope.gotoSection($rootScope.profile.metaData, 'metaData');
                }
                $scope.loading = false;

        };


        $scope.collectData = function (node, segRefOrGroups, segments, datatypes) {
            if (node) {
                if (node.type === 'message') {
                    angular.forEach(node.children, function (segmentRefOrGroup) {
                        $scope.collectData(segmentRefOrGroup, segRefOrGroups, segments, datatypes);
                    });
                } else if (node.type === 'group') {
                    segRefOrGroups.push(node);
                    if (node.children) {
                        angular.forEach(node.children, function (segmentRefOrGroup) {
                            $scope.collectData(segmentRefOrGroup, segRefOrGroups, segments, datatypes);
                        });
                    }
                    segRefOrGroups.push({ name: node.name, "type": "end-group"});
                } else if (node.type === 'segment') {
                    if (segments.indexOf(node) === -1) {
                        segments.push(node);
                    }
                    angular.forEach(node.fields, function (field) {
                        $scope.collectData(field, segRefOrGroups, segments, datatypes);
                    });
                } else if (node.type === 'segmentRef') {
                    segRefOrGroups.push(node);
                    $scope.collectData($rootScope.segmentsMap[node.ref], segRefOrGroups, segments, datatypes);
                } else if (node.type === 'component' || node.type === 'subcomponent' || node.type === 'field') {
                    $scope.collectData($rootScope.datatypesMap[node.datatype], segRefOrGroups, segments, datatypes);
                } else if (node.type === 'datatype') {
                    if (datatypes.indexOf(node) === -1) {
                        datatypes.push(node);
                    }
                    if (node.components) {
                        angular.forEach(node.children, function (component) {
                            $scope.collectData(component, segRefOrGroups, segments, datatypes);
                        });
                    }
                }
            }
        };

        $scope.delete = function (id) {
//            waitingDialog.show('Deleting profile...', {dialogSize: 'sm', progressType: 'danger'});
            var profile = $scope.findOne(id);
            if (profile != null) {
                $scope.confirmDelete(profile);
            }
        };

        $scope.confirmDelete = function (profile) {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmProfileDeleteCtrl.html',
                controller: 'ConfirmProfileDeleteCtrl',
                resolve: {
                    profileToDelete: function () {
                        return profile;
                    }
                }
            });
            modalInstance.result.then(function (profile) {
                $scope.profileToDelete = profile;
            }, function () {
            });
        };


        $scope.confirmClose = function () {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmProfileCloseCtrl.html',
                controller: 'ConfirmProfileCloseCtrl'
            });
            modalInstance.result.then(function () {
            }, function () {
            });
        };


        $scope.exportAs = function (id, format) {
            var form = document.createElement("form");
            form.action = $rootScope.api('api/profiles/' + id + '/export/' + format);
            form.method = "POST";
            form.target = "_target";
            var csrfInput = document.createElement("input");
            csrfInput.name = "X-XSRF-TOKEN";
            csrfInput.value = $cookies['XSRF-TOKEN'];
//            console.log("CSRF=" + csrfInput.value);
            form.appendChild(csrfInput);
            form.style.display = 'none';
            document.body.appendChild(form);
//            httpHeaders.common['X-XSRF-TOKEN'] = $cookies['XSRF-TOKEN'];
//            httpHeaders.common['JSSESSIONID'] = $cookies['JSSESSIONID'];
            form.submit();
        };


        $scope.close = function () {
            if ($rootScope.hasChanges()) {
                $scope.confirmClose();
            }else{
                waitingDialog.show('Closing profile...', {dialogSize: 'sm', progressType: 'info'});
                $rootScope.profile = null;
                $rootScope.selectIgTab(0);
                $rootScope.initMaps();
                waitingDialog.hide();
             }
        };


        $scope.gotoSection = function (obj, type) {
            $rootScope.section['data'] = obj;
            $rootScope.section['type'] = type;
        };


        $scope.save = function () {
            waitingDialog.show('Saving changes...', {dialogSize: 'sm', progressType: 'success'});
            var changes = angular.toJson($rootScope.changes);
            var data = {"changes": changes, "profile": $rootScope.profile};
            $http.post('api/profiles/' + $rootScope.profile.id + '/save', data, {timeout: 60000}).then(function (response) {
                var saveResponse = angular.fromJson(response.data);
                $rootScope.profile.metaData.date = saveResponse.date;
                $rootScope.profile.metaData.version = saveResponse.version;
                $rootScope.msg().text = "igSaveSuccess";
                $rootScope.msg().type = "success";
                $rootScope.msg().show = true;
                waitingDialog.hide();
            }, function (error) {
                $scope.error = error;
                $rootScope.msg().text = "igSaveFailed";
                $rootScope.msg().type = "error";
                $rootScope.msg().show = true;
                waitingDialog.hide();
            });
        };

        $scope.exportChanges = function () {
            var form = document.createElement("form");
            form.action = 'api/profiles/export/changes';
            form.method = "POST";
            form.target = "_target";
            var input = document.createElement("textarea");
            input.name = "content";
            input.value = angular.fromJson($rootScope.changes);
            form.appendChild(input);
            var csrfInput = document.createElement("input");
            csrfInput.name = "X-XSRF-TOKEN";
            csrfInput.value = $cookies['XSRF-TOKEN'];
            form.appendChild(csrfInput);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };

        $scope.viewChanges = function (changes) {
            var modalInstance = $modal.open({
                templateUrl: 'ViewIGChangesCtrl.html',
                controller: 'ViewIGChangesCtrl',
                resolve: {
                    changes: function () {
                        return changes;
                    }
                }
            });
            modalInstance.result.then(function (changes) {
                $scope.changes = changes;
            }, function () {
            });
        };


        $scope.reset = function () {
//            $rootScope.context.page = $rootScope.pages[0];
            $rootScope.selectIgTab(0);
            $rootScope.changes = {};
            $rootScope.profile = null;
        };


        $scope.initProfile = function () {
            $scope.loading = true;
            if ($rootScope.profile != null && $rootScope.profile != undefined)
                $scope.gotoSection($rootScope.profile.metaData, 'metaData');
            $scope.loading = false;

        };


    });


angular.module('igl').controller('ViewIGChangesCtrl', function ($scope, $modalInstance, changes, $rootScope, $http) {
    $scope.changes = changes;
    $scope.loading = false;
    $scope.exportChanges = function () {
        $scope.loading = true;
        waitingDialog.show('Exporting changes...', {dialogSize: 'sm', progressType: 'success'});
        var form = document.createElement("form");
        form.action = 'api/profiles/export/changes';
        form.method = "POST";
        form.target = "_target";
        form.style.display = 'none';
        form.params = document.body.appendChild(form);
        form.submit();
        waitingDialog.hide();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


angular.module('igl').controller('ConfirmProfileDeleteCtrl', function ($scope, $modalInstance, profileToDelete, $rootScope, $http) {
    $scope.profileToDelete = profileToDelete;
    $scope.loading = false;
    $scope.delete = function () {
        $scope.loading = true;
//        waitingDialog.show('Deleting profile...', {dialogSize: 'sm', progressType: 'danger'});
        $http.post($rootScope.api('api/profiles/' + $scope.profileToDelete.id + '/delete'), {timeout: 60000}).then(function (response) {
            var index = $rootScope.customIgs.indexOf($scope.profileToDelete);
            if (index > -1) $rootScope.customIgs.splice(index, 1);
            $rootScope.backUp = null;
            if ($scope.profileToDelete === $rootScope.profile) {
                $rootScope.initMaps();
                $rootScope.profile = null;
                $rootScope.selectIgTab(0);
            }
            $rootScope.msg().text = "igDeleteSuccess";
            $rootScope.msg().type = "success";
            $rootScope.msg().show = true;
            $rootScope.manualHandle = true;
            $scope.profileToDelete = null;
//            waitingDialog.hide();
            $modalInstance.close($scope.profileToDelete);

        }, function (error) {
            $scope.error = error;
            $modalInstance.close($scope.profileToDelete);

//            waitingDialog.hide();
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


angular.module('igl').controller('ConfirmProfileCloseCtrl', function ($scope, $modalInstance, $rootScope, $http) {
    $scope.loading = false;
    $scope.close = function () {
        $rootScope.changes = {};
        $rootScope.profile = null;
        $rootScope.selectIgTab(0);
        $rootScope.initMaps();
        $scope.cancel();
    };

    $scope.saveAndClose = function () {
        waitingDialog.show('Saving changes...', {dialogSize: 'sm', progressType: 'success'});
        var changes = angular.toJson($rootScope.changes);
        var data = {"changes": changes, "profile": $rootScope.profile};
        $http.post('api/profiles/' + $rootScope.profile.id + '/save', data, {timeout: 60000}).then(function (response) {
            var saveResponse = angular.fromJson(response.data);
            $rootScope.profile.metaData.date = saveResponse.date;
            $rootScope.profile.metaData.version = saveResponse.version;
            $scope.close();
            waitingDialog.hide();
        }, function (error) {
            $scope.error = error;
            $rootScope.msg().text = "igSaveFailed";
            $rootScope.msg().type = "error";
            $rootScope.msg().show = true;
            $scope.close();
            waitingDialog.hide();

        });
    };


    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


