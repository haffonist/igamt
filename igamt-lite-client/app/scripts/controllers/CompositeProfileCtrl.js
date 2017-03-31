angular.module('igl').controller('ListCompositeProfileCtrl', function($scope, $rootScope, $http, $modal, CompositeProfileService, TableService, DatatypeService) {

    $scope.redirectVS = function(binding) {

        TableService.getOne(binding.tableId).then(function(valueSet) {
            var modalInstance = $modal.open({
                templateUrl: 'redirectCtrl.html',
                controller: 'redirectCtrl',
                size: 'md',
                resolve: {
                    destination: function() {
                        return valueSet;
                    }
                }



            });
            modalInstance.result.then(function() {
                $rootScope.editTable(valueSet);
            });
        });
    };


    $scope.save = function() {
        console.log($rootScope.compositeProfileStructure);
        $scope.saving = true;
        CompositeProfileService.save($rootScope.compositeProfileStructure).then(function(result) {

                console.log("in BUild");
                $rootScope.compositeProfileStructure = result;
                $rootScope.$emit("event:updateIgDate");
                for (var i = 0; i < $rootScope.igdocument.profile.compositeProfiles.children.length; i++) {
                    if ($rootScope.igdocument.profile.compositeProfiles.children[i].id === result.id) {
                        $rootScope.igdocument.profile.compositeProfiles.children[i] = result;
                    }
                }
                $rootScope.compositeProfilesStructureMap[result.id] = result;
                console.log(result);
                $rootScope.editCM(result);
                cleanState();

            },
            function(error) {
                $rootScope.msg().text = error.data.text;
                $rootScope.msg().type = error.data.type;
                $rootScope.msg().show = true;
            });
    };
    var updatePcPosition = function(pcList) {
        for (var i = 0; i < pcList.length; i++) {
            pcList[i].position = i + 1;
        }
    };
    $scope.changePosition = function() {
        console.log($rootScope.compositeProfile);
        updatePcPosition($rootScope.compositeProfile.appliedProfileComponents);
        for (var i = 0; i < $rootScope.compositeProfileStructure.profileComponentsInfo.length; i++) {
            for (var j = 0; j < $rootScope.compositeProfile.appliedProfileComponents.length; j++) {
                if ($rootScope.compositeProfileStructure.profileComponentsInfo[i].id === $rootScope.compositeProfile.appliedProfileComponents[j].pc.id) {
                    $rootScope.compositeProfileStructure.profileComponentsInfo[i].position = $rootScope.compositeProfile.appliedProfileComponents[j].position;
                }
            }
        }
        $scope.save();
        console.log($rootScope.compositeProfileStructure);
    };
    $scope.removePc = function(pcId) {
        for (var i = 0; i < $rootScope.compositeProfileStructure.profileComponentsInfo.length; i++) {

            if ($rootScope.compositeProfileStructure.profileComponentsInfo[i].id === pcId) {
                $rootScope.compositeProfileStructure.profileComponentsInfo.splice(i, 1);
            }
        }
        updatePcPosition($rootScope.compositeProfileStructure.profileComponentsInfo);
        console.log("------");
        console.log($rootScope.compositeProfileStructure);
        console.log("------");

        CompositeProfileService.removePc($rootScope.compositeProfileStructure, pcId).then(function(result) {
            CompositeProfileService.build(result).then(function(profile) {
                $rootScope.compositeProfileStructure = result;
                $rootScope.compositeProfilesStructureMap[result.id] = result;
                for (var i = 0; i < $rootScope.igdocument.profile.compositeProfiles.children.length; i++) {
                    if ($rootScope.igdocument.profile.compositeProfiles.children[i].id === $rootScope.compositeProfileStructure.id) {
                        $rootScope.igdocument.profile.compositeProfiles.children[i] = $rootScope.compositeProfileStructure;
                    }
                }
                for (var i = 0; i < $rootScope.profileComponents.length; i++) {
                    if ($rootScope.profileComponents[i].id === pcId) {
                        for (var j = 0; j < $rootScope.profileComponents[i].compositeProfileStructureList.length; j++) {
                            if ($rootScope.profileComponents[i].compositeProfileStructureList[j] === result.id) {
                                $rootScope.profileComponents[i].compositeProfileStructureList.splice(j, 1);
                                $rootScope.profileComponentsMap[$rootScope.profileComponents[i].id] = $rootScope.profileComponents[i];
                            }
                        }
                    }
                }
                $rootScope.editCM(result);
            });

        }, function(error) {
            $rootScope.msg().text = error.data.text;
            $rootScope.msg().type = error.data.type;
            $rootScope.msg().show = true;
        });


    };

    var cleanState = function() {

        $scope.clearDirty();
        $scope.editForm.$setPristine();
        $scope.editForm.$dirty = false;
        $rootScope.clearChanges();
        if ($scope.compositeMessageParams) {
            $scope.compositeMessageParams.refresh();
        }
    };
    $scope.editCommentDlg = function(node, comment, disabled, type) {
        var modalInstance = $modal.open({
            templateUrl: 'EditComment.html',
            controller: 'EditCommentCtrlInPc',
            backdrop: true,
            keyboard: true,
            windowClass: 'input-text-modal-window',
            backdropClick: false,
            resolve: {
                currentNode: function() {
                    return node;
                },
                currentComment: function() {
                    return comment;
                },
                disabled: function() {
                    return disabled;
                },
                type: function() {
                    return type;
                }
            }
        });

        modalInstance.result.then(function() {

        });

    };
    $scope.isAvailableConstantValue = function(node) {
        if (node.type === "field" || node.type === "component") {
            if ($scope.hasChildren(node)) return false;
            var bindings = $scope.findingBindings(node);
            if (bindings && bindings.length > 0) return false;
            if ($rootScope.compositeProfile.datatypesMap[node.datatype.id].name == 'ID' || $rootScope.compositeProfile.datatypesMap[node.datatype.id].name == "IS") return false;
            return true;
        } else {
            return false;
        }

    };
    $scope.hasChildren = function(node) {
        return node && node != null && ((node.fields && node.fields.length > 0) || (node.datatype && $rootScope.compositeProfile.datatypesMap[node.datatype.id] && $rootScope.compositeProfile.datatypesMap[node.datatype.id].components && $rootScope.compositeProfile.datatypesMap[node.datatype.id].components.length > 0));
    };


    $scope.isAvailableForValueSet = function(node) {

        if (node && node.datatype) {
            var currentDT = $rootScope.compositeProfile.datatypesMap[node.datatype.id];
            if (_.find($rootScope.config.valueSetAllowedDTs, function(valueSetAllowedDT) {
                    return valueSetAllowedDT == currentDT.name;
                })) return true;
        }

        if (node && node.fieldDT && !node.componentDT) {
            var parentDT = $rootScope.compositeProfile.datatypesMap[node.fieldDT];
            var pathSplit = node.segmentPath.split(".");
            if (_.find($rootScope.config.valueSetAllowedComponents, function(valueSetAllowedComponent) {
                    return valueSetAllowedComponent.dtName == parentDT.name && valueSetAllowedComponent.location == pathSplit[1];
                })) return true;
        }

        if (node && node.componentDT) {
            var parentDT = $rootScope.compositeProfile.datatypesMap[node.componentDT];
            var pathSplit = node.segmentPath.split(".");
            if (_.find($rootScope.config.valueSetAllowedComponents, function(valueSetAllowedComponent) {
                    return valueSetAllowedComponent.dtName == parentDT.name && valueSetAllowedComponent.location == pathSplit[2];
                })) return true;
        }

        return false;
    };
    $scope.findingComments = function(node) {
        var result = [];
        if (node && $rootScope.compositeProfile) {
            result = _.filter($rootScope.compositeProfile.comments, function(comment) {
                return comment.location == $rootScope.refinePath(node.path);
            });
            for (var i = 0; i < result.length; i++) {
                result[i].from = 'compositeProfile';
                result[i].index = i + 1;
            }

            if (node.segment) {
                var parentSeg = $rootScope.compositeProfile.segmentsMap[node.segment];
                var subResult = _.filter(parentSeg.comments, function(comment) {
                    return comment.location == node.segmentPath;
                });
                for (var i = 0; i < subResult.length; i++) {
                    subResult[i].from = 'segment';
                    subResult[i].index = i + 1;
                }
                result = result.concat(subResult);
            }

            if (node.fieldDT) {
                var parentDT = $rootScope.compositeProfile.datatypesMap[node.fieldDT];
                var subPath = node.segmentPath.substr(node.segmentPath.indexOf('.') + 1);
                var subSubResult = _.filter(parentDT.comments, function(comment) {
                    return comment.location == subPath;
                });
                for (var i = 0; i < subSubResult.length; i++) {
                    subSubResult[i].from = 'field';
                    subSubResult[i].index = i + 1;
                }
                result = result.concat(subSubResult);
            }

            if (node.componentDT) {
                var parentDT = $rootScope.compositeProfile.datatypesMap[node.componentDT];
                var subPath = node.segmentPath.substr(node.segmentPath.split('.', 2).join('.').length + 1);
                var subSubSubResult = _.filter(parentDT.comments, function(comment) {
                    return comment.location == subPath;
                });
                for (var i = 0; i < subSubSubResult.length; i++) {
                    subSubSubResult[i].from = 'component';
                    subSubSubResult[i].index = i + 1;
                }
                result = result.concat(subSubSubResult);
            }
        }

        return result;
    };


    $scope.findingBindings = function(node) {
        var result = [];

        if (node && $rootScope.compositeProfile) {
            result = _.filter($rootScope.compositeProfile.valueSetBindings, function(binding) {

                return binding.location == $rootScope.refinePath(node.path);
            });
            for (var i = 0; i < result.length; i++) {
                result[i].bindingFrom = 'compositeProfile';
            }

            if (result && result.length > 0) {
                return result;
            }

            if (node.segment) {
                var parentSeg = $rootScope.compositeProfile.segmentsMap[node.segment];
                result = _.filter(parentSeg.valueSetBindings, function(binding) {
                    return binding.location == node.segmentPath;
                });
                for (var i = 0; i < result.length; i++) {
                    result[i].bindingFrom = 'segment';
                }
            }

            if (result && result.length > 0) {
                return result;
            }

            if (node.fieldDT) {
                var parentDT = $rootScope.compositeProfile.datatypesMap[node.fieldDT];
                var subPath = node.segmentPath.substr(node.segmentPath.indexOf('.') + 1);
                result = _.filter(parentDT.valueSetBindings, function(binding) {
                    return binding.location == subPath;
                });
                for (var i = 0; i < result.length; i++) {
                    result[i].bindingFrom = 'field';
                }
            }

            if (result && result.length > 0) {
                return result;
            }

            if (node.componentDT) {
                var parentDT = $rootScope.compositeProfile.datatypesMap[node.componentDT];
                var subPath = node.segmentPath.substr(node.segmentPath.split('.', 2).join('.').length + 1);
                result = _.filter(parentDT.valueSetBindings, function(binding) {
                    return binding.location == subPath;
                });
                for (var i = 0; i < result.length; i++) {
                    result[i].bindingFrom = 'component';
                }
            }
        }

        return result;
    };
    $scope.findingSingleElement = function(node) {
        var result = [];

        if (node && $rootScope.compositeProfile) {
            result = _.filter($rootScope.compositeProfile.singleElementValues, function(binding) {
                return binding.location == $rootScope.refinePath(node.path);
            });
            for (var i = 0; i < result.length; i++) {
                result[i].from = 'message';
            }
            if (result && result.length > 0) {

                return result;
            }

            if (node.segment) {
                var parentSeg = $rootScope.compositeProfile.segmentsMap[node.segment];
                result = _.filter(parentSeg.singleElementValues, function(binding) {
                    return binding.location == node.segmentPath;
                });
                for (var i = 0; i < result.length; i++) {
                    result[i].from = 'segment';
                }
            }

            if (result && result.length > 0) {
                return result;
            }

            if (node.fieldDT) {
                var parentDT = $rootScope.compositeProfile.datatypesMap[node.fieldDT];
                var subPath = node.segmentPath.substr(node.segmentPath.indexOf('.') + 1);
                result = _.filter(parentDT.singleElementValues, function(binding) {
                    return binding.location == subPath;
                });
                for (var i = 0; i < result.length; i++) {
                    result[i].from = 'field';
                }
            }

            if (result && result.length > 0) {
                return result;
            }

            if (node.componentDT) {
                var parentDT = $rootScope.compositeProfile.datatypesMap[node.componentDT];
                var subPath = node.segmentPath.substr(node.segmentPath.split('.', 2).join('.').length + 1);
                result = _.filter(parentDT.singleElementValues, function(binding) {
                    return binding.location == subPath;
                });
                for (var i = 0; i < result.length; i++) {
                    result[i].from = 'component';
                }
            }
        }


        return result;
    };

});