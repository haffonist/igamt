/**
 * Created by Jungyub on 4/01/15.
 */

angular.module('igl').controller('TableListCtrl', function($scope, $rootScope, Restangular, $filter, $http, $modal, $timeout, CloneDeleteSvc, TableService, TableLibrarySvc, blockUI) {
    $scope.readonly = false;
    $scope.codeSysEditMode = false;
    $scope.codeSysForm = {};
    $scope.saved = false;
    $scope.message = false;
    $scope.params = null;
    $scope.predicate = 'value';
    $scope.reverse = false;
    $scope.isDeltaCalled = false;

    $scope.init = function() {
        $rootScope.$on('event:cloneTableFlavor', function(event, table) {
            $scope.copyTable(table);
        });
    };

    $scope.reset = function() {
        blockUI.start();
        cleanState();
        $rootScope.table = angular.copy($rootScope.tablesMap[$rootScope.table.id]);
        blockUI.stop();
    };

    var cleanState = function() {
        $scope.saving = false;
        $scope.selectedChildren = [];
        if ($scope.editForm) {
            $scope.editForm.$setPristine();
            $scope.editForm.$dirty = false;
        }
        $rootScope.clearChanges();
    };
    $scope.callVSDelta = function() {

        $rootScope.$emit("event:openVSDelta");
    };


    $scope.save = function() {

        if ($rootScope.table.scope === 'USER') {
            $scope.saving = true;
            var table = $rootScope.table;
            var bindingIdentifier = table.bindingIdentifier;


            if (table.libIds == undefined) table.libIds = [];
            if (table.libIds.indexOf($rootScope.igdocument.profile.tableLibrary.id) == -1) {
                table.libIds.push($rootScope.igdocument.profile.tableLibrary.id);
            }

            TableService.save(table).then(function(result) {
                var oldLink = TableLibrarySvc.findOneChild(result.id, $rootScope.igdocument.profile.tableLibrary.children);
                TableService.merge($rootScope.tablesMap[result.id], result);
                var newLink = TableService.getTableLink(result);
                newLink.bindingIdentifier = bindingIdentifier;
                TableLibrarySvc.updateChild($rootScope.igdocument.profile.tableLibrary.id, newLink).then(function(link) {
                    oldLink.bindingIdentifier = link.bindingIdentifier;
                    cleanState();
                    $rootScope.msg().text = "tableSaved";
                    $rootScope.msg().type = "success";
                    $rootScope.msg().show = true;
                }, function(error) {
                    $scope.saving = false;
                    $rootScope.msg().text = error.data.text;
                    $rootScope.msg().type = error.data.type;
                    $rootScope.msg().show = true;
                });
            }, function(error) {
                $scope.saving = false;
                $rootScope.msg().text = error.data.text;
                $rootScope.msg().type = error.data.type;
                $rootScope.msg().show = true;
            });
        }
    };


    $scope.addTable = function() {
        $rootScope.newTableFakeId = $rootScope.newTableFakeId - 1;
        var newTable = angular.fromJson({
            id: new ObjectId().toString(),
            type: 'table',
            bindingIdentifier: '',
            name: '',
            version: '',
            oid: '',
            tableType: '',
            stability: '',
            extensibility: '',
            codes: []
        });
        $rootScope.tables.push(newTable);
        $rootScope.tablesMap[newTable.id] = newTable;
        $rootScope.table = newTable;
        $rootScope.recordChangeForEdit2('table', "add", newTable.id, 'table', newTable);
        $scope.setDirty();
    };


    $scope.makeCodeSystemEditable = function() {
        $scope.codeSysEditMode = true;
    };


    $scope.addCodeSystem = function() {
        if ($rootScope.codeSystems.indexOf($scope.codeSysForm.str) < 0) {
            if ($scope.codeSysForm.str && $scope.codeSysForm.str !== '') {
                $rootScope.codeSystems.push($scope.codeSysForm.str);
            }
        }
        $scope.codeSysForm.str = '';
        $scope.codeSysEditMode = false;
    };

    $scope.delCodeSystem = function(value) {
        $rootScope.codeSystems.splice($rootScope.codeSystems.indexOf(value), 1);
    }

    $scope.updateCodeSystem = function(table, codeSystem) {
        for (var i = 0; i < $rootScope.table.codes.length; i++) {
            $rootScope.table.codes[i].codeSystem = codeSystem;
            $scope.recordChangeValue($rootScope.table.codes[i], 'codeSystem', $rootScope.table.codes[i].codeSystem, table.id);
        }
    }

    $scope.addValue = function() {
        $rootScope.newValueFakeId = $rootScope.newValueFakeId ? $rootScope.newValueFakeId - 1 : -1;
        var newValue = {
            id: new ObjectId().toString(),
            type: 'value',
            value: '',
            label: '',
            codeSystem: null,
            codeUsage: 'R'
        };


        $rootScope.table.codes.unshift(newValue);
        var newValueBlock = { targetType: 'table', targetId: $rootScope.table.id, obj: newValue };
        if (!$scope.isNewObject('table', 'add', $rootScope.table.id)) {
            $rootScope.recordChangeForEdit2('value', "add", null, 'value', newValueBlock);
        }
        $scope.setDirty();
    };

    $scope.deleteValue = function(value) {
        if (!$scope.isNewValueThenDelete(value.id)) {
            $rootScope.recordChangeForEdit2('value', "delete", value.id, 'id', value.id);
        }
        $rootScope.table.codes.splice($rootScope.table.codes.indexOf(value), 1);
        $scope.setDirty();
    };

    $scope.isNewValueThenDelete = function(id) {
        if ($rootScope.isNewObject('value', 'add', id)) {
            if ($rootScope.changes['value'] !== undefined && $rootScope.changes['value']['add'] !== undefined) {
                for (var i = 0; i < $rootScope.changes['value']['add'].length; i++) {
                    var tmp = $rootScope.changes['value']['add'][i];
                    if (tmp.obj.id === id) {
                        $rootScope.changes['value']['add'].splice(i, 1);
                        if ($rootScope.changes["value"]["add"] && $rootScope.changes["value"]["add"].length === 0) {
                            delete $rootScope.changes["value"]["add"];
                        }

                        if ($rootScope.changes["value"] && Object.getOwnPropertyNames($rootScope.changes["value"]).length === 0) {
                            delete $rootScope.changes["value"];
                        }
                        return true;
                    }
                }
            }
            return true;
        }
        if ($rootScope.changes['value'] !== undefined && $rootScope.changes['value']['edit'] !== undefined) {
            for (var i = 0; i < $rootScope.changes['value']['edit'].length; i++) {
                var tmp = $rootScope.changes['value']['edit'][i];
                if (tmp.id === id) {
                    $rootScope.changes['value']['edit'].splice(i, 1);
                    if ($rootScope.changes["value"]["edit"] && $rootScope.changes["value"]["edit"].length === 0) {
                        delete $rootScope.changes["value"]["edit"];
                    }

                    if ($rootScope.changes["value"] && Object.getOwnPropertyNames($rootScope.changes["value"]).length === 0) {
                        delete $rootScope.changes["value"];
                    }
                    return false;
                }
            }
            return false;
        }
        return false;
    };

    $scope.isNewValue = function(id) {
        return $scope.isNewObject('value', 'add', id);
    };

    $scope.isNewTable = function(id) {
        return $scope.isNewObject('table', 'add', id);
    };

    $scope.close = function() {
        $rootScope.table = null;
    };

    $scope.copyTable = function(table) {
        CloneDeleteSvc.copyTable(table);
    };

    $scope.recordChangeValue = function(value, valueType, tableId) {
        if (!$scope.isNewTable(tableId)) {
            if (!$scope.isNewValue(value.id)) {
                $rootScope.recordChangeForEdit2('value', 'edit', value.id, valueType, value);
            }
        }
        $scope.setDirty();
    };

    $scope.recordChangeTable = function(table, valueType, value) {
        if (!$scope.isNewTable(table.id)) {
            $rootScope.recordChangeForEdit2('table', 'edit', table.id, valueType, value);
        }
        $scope.setDirty();
    };

    $scope.setAllCodeUsage = function(table, usage) {
        for (var i = 0, len = table.codes.length; i < len; i++) {
            if (table.codes[i].codeUsage !== usage) {
                table.codes[i].codeUsage = usage;
                if (!$scope.isNewTable(table.id) && !$scope.isNewValue(table.codes[i].id)) {
                    $rootScope.recordChangeForEdit2('value', 'edit', table.codes[i].id, 'codeUsage', usage);
                }
            }
        }
        $scope.setDirty();
    };

    $scope.delete = function(table) {
        CloneDeleteSvc.deleteValueSet(table);
    };
});

angular.module('igl').controller('TableModalCtrl', function($scope) {
    $scope.showModal = false;
    $scope.toggleModal = function() {
        $scope.showModal = !$scope.showModal;
    };
});

angular.module('igl').controller('ConfirmValueSetDeleteCtrl', function($scope, $modalInstance, tableToDelete, $rootScope, TableService, TableLibrarySvc, CloneDeleteSvc) {
    $scope.tableToDelete = tableToDelete;
    $scope.loading = false;


    $scope.delete = function() {
        $scope.loading = true;
        if ($scope.tableToDelete.scope === 'USER') {
            CloneDeleteSvc.deleteTableAndTableLink($scope.tableToDelete);
        } else {
            CloneDeleteSvc.deleteTableLink($scope.tableToDelete);
        }
        $modalInstance.close($scope.tableToDelete);
        $scope.loading = false;
    };


    //    $scope.delete = function () {
    //        $scope.loading = true;
    //
    //        if (!$scope.isNewTableThenDelete(tableToDelete.id)) {
    ////        	$rootScope.recordChangeForEdit2('table', "delete", tableToDelete.id,'id', tableToDelete.id);
    //        }
    //        // We must delete from two collections.
    //        var index = $rootScope.tables.indexOf(tableToDelete);
    //        $rootScope.tables.splice(index, 1);
    //        var index = $rootScope.igdocument.profile.tableLibrary.children.indexOf($scope.tableToDelete);
    //        if (index > -1) $rootScope.igdocument.profile.tableLibrary.children.splice(index, 1);
    //        $rootScope.tablesMap[tableToDelete.id] = undefined;
    //
    //        $rootScope.generalInfo.type = 'info';
    //        $rootScope.generalInfo.message = "Table " + $scope.tableToDelete.bindingIdentifier + " deleted successfully";
    //
    //        if ($rootScope.table === $scope.tableToDelete) {
    //            $rootScope.table = null;
    //        }
    //
    //        $rootScope.references = [];
    //		$rootScope.$broadcast('event:SetToC');
    //        $modalInstance.close($scope.tableToDelete);
    //    };

    //    $scope.delete = function () {
    //        $scope.loading = true;
    //
    //        TableService.delete($scope.tableToDelete).then(function (result) {
    //                TableLibrarySvc.deleteChild($scope.tableToDelete.id).then(function (res) {
    //                    // We must delete from two collections.
    //                    var index = $rootScope.tables.indexOf($scope.tableToDelete);
    //                    $rootScope.tables.splice(index, 1);
    //                    var tmp = TableLibrarySvc.findOneChiletd($scope.tableToDelete.id, $rootScope.igdocument.profile.tableLibrary.children);
    //                    index = $rootScope.igdocument.profile.tableLibrary.children.indexOf(tmp);
    //                    $rootScope.igdocument.profile.tableLibrary.children.splice(index, 1);
    //                    $rootScope.tablesMap[$scope.tableToDelete.id] = null;
    //                    $rootScope.references = [];
    //                    if ($rootScope.table === $scope.tableToDelete) {
    //                        $rootScope.table = null;
    //                    }
    //                    $rootScope.recordDelete("table", "edit", $scope.tableToDelete.id);
    //                    $rootScope.msg().text = "tableDeleteSuccess";
    //                    $rootScope.msg().type = "success";
    //                    $rootScope.msg().show = true;
    //                    $rootScope.manualHandle = true;
    //                    $scope.loading = false;
    //                    $rootScope.$broadcast('event:SetToC');
    //                    $modalInstance.close($scope.tableToDelete);
    //                }, function (error) {
    //                    $rootScope.msg().text = error.data.text;
    //                    $rootScope.msg().type = "danger";
    //                    $rootScope.msg().show = true;
    //                    $rootScope.manualHandle = true;
    //                    $scope.loading = false;
    //                });
    //            }, function (error) {
    //                $rootScope.msg().text = error.data.text;
    //                $rootScope.msg().type = "danger";
    //                $rootScope.msg().show = true;
    //                $rootScope.manualHandle = true;
    //                $scope.loading = false;
    //            }
    //        );
    //    };


    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };


    $scope.isNewTableThenDelete = function(id) {
        if ($rootScope.isNewObject('table', 'add', id)) {
            if ($rootScope.changes['table'] !== undefined && $rootScope.changes['table']['add'] !== undefined) {
                for (var i = 0; i < $rootScope.changes['table']['add'].length; i++) {
                    var tmp = $rootScope.changes['table']['add'][i];
                    if (tmp.id == id) {
                        $rootScope.changes['table']['add'].splice(i, 1);
                        if ($rootScope.changes["table"]["add"] && $rootScope.changes["table"]["add"].length === 0) {
                            delete $rootScope.changes["table"]["add"];
                        }

                        if ($rootScope.changes["table"] && Object.getOwnPropertyNames($rootScope.changes["table"]).length === 0) {
                            delete $rootScope.changes["table"];
                        }
                        return true;
                    }
                }
            }
            return true;
        }
        if ($rootScope.changes['table'] !== undefined && $rootScope.changes['table']['edit'] !== undefined) {
            for (var i = 0; i < $rootScope.changes['table']['edit'].length; i++) {
                var tmp = $rootScope.changes['table']['edit'][i];
                if (tmp.id === id) {
                    $rootScope.changes['table']['edit'].splice(i, 1);
                    if ($rootScope.changes["table"]["edit"] && $rootScope.changes["table"]["edit"].length === 0) {
                        delete $rootScope.changes["table"]["edit"];
                    }

                    if ($rootScope.changes["table"] && Object.getOwnPropertyNames($rootScope.changes["table"]).length === 0) {
                        delete $rootScope.changes["table"];
                    }
                    return false;
                }
            }
            return false;
        }
        return false;
    };
});

angular.module('igl').controller('ValueSetReferencesCtrl', function($scope, $modalInstance, tableToDelete) {

    $scope.tableToDelete = tableToDelete;

    $scope.ok = function() {
        $modalInstance.close($scope.tableToDelete);
    };

    $scope.cancel = function() {
        $modalInstance.dismiss('cancel');
    };
});


angular.module('igl').controller('cmpTableCtrl', function($scope, $modal, ObjectDiff, orderByFilter, $rootScope, $q, $interval, ngTreetableParams, $http, StorageService, userInfoService, IgDocumentService, SegmentService, DatatypeService, SegmentLibrarySvc, DatatypeLibrarySvc, TableLibrarySvc, CompareService) {
    var ctrl = this;
    this.tableId = -1;
    $scope.vsChanged = false;
    $scope.variable = false;
    $scope.isDeltaCalled = false;

    $scope.setDeltaToF = function() {
        console.log("HEEEEEERREEEEE");
        $scope.isDeltaCalled = false;
    }



    $scope.scopes = [{
        name: "USER",
        alias: "My IG"
    }, {
        name: "HL7STANDARD",
        alias: "Base HL7"
    }];
    var listHL7Versions = function() {
        return $http.get('api/igdocuments/findVersions', {
            timeout: 60000
        }).then(function(response) {
            var hl7Versions = [];
            var length = response.data.length;
            for (var i = 0; i < length; i++) {
                hl7Versions.push(response.data[i]);
            }
            return hl7Versions;
        });
    };
    $scope.status = {
        isCustomHeaderOpen: false,
        isFirstOpen: true,
        isSecondOpen: true,
        isFirstDisabled: false
    };

    $scope.initt = function() {
        $scope.isDeltaCalled = true;
        $scope.dataList = [];
        listHL7Versions().then(function(versions) {
            $scope.versions = versions;
            $scope.version1 = angular.copy($rootScope.igdocument.profile.metaData.hl7Version);
            $scope.scope1 = "USER";
            $scope.ig1 = angular.copy($rootScope.igdocument.profile.metaData.name);
            $scope.table1 = angular.copy($rootScope.table);
            ctrl.tableId = -1;
            $scope.variable = !$scope.variable;
            $scope.tables = null;
            //$scope.setIG2($scope.ig2);
            $scope.version2 = angular.copy($scope.version1);
            //$scope.status.isFirstOpen = true;
            $scope.scope2 = "HL7STANDARD";
            if ($scope.dynamicVs_params) {
                $scope.showDelta = false;
                $scope.status.isFirstOpen = true;
                $scope.dynamicVs_params.refresh();
            }
        });



    };

    $scope.$on('event:loginConfirmed', function(event) {
        $scope.initt();
    });

    //$scope.initt();

    $rootScope.$on('event:initTable', function(event) {
        if ($scope.isDeltaCalled) {
            $scope.initt();
        }
    });

    $rootScope.$on('event:openVSDelta', function(event) {
        $scope.initt();
    });



    $scope.setVersion2 = function(vr) {
        $scope.version2 = vr;

    };
    $scope.setScope2 = function(scope) {

        $scope.scope2 = scope;
    };

    $scope.$watchGroup(['table1', 'table2'], function() {
        $scope.vsChanged = true;
        //$scope.segment1 = angular.copy($rootScope.activeSegment);


    }, true);
    $scope.$watchGroup(['version2', 'scope2', 'variable'], function() {
        $scope.igList2 = [];
        $scope.tables2 = [];
        $scope.ig2 = "";
        if ($scope.scope2 && $scope.version2) {
            IgDocumentService.getIgDocumentsByScopesAndVersion([$scope.scope2], $scope.version2).then(function(result) {
                if (result) {
                    if ($scope.scope2 === "HL7STANDARD") {
                        $scope.igDisabled2 = true;
                        $scope.ig2 = {
                            id: result[0].id,
                            title: result[0].metaData.title
                        };
                        $scope.igList2.push($scope.ig2);

                        $scope.setIG2($scope.ig2);
                    } else {
                        $scope.igDisabled2 = false;
                        for (var i = 0; i < result.length; i++) {
                            $scope.igList2.push({
                                id: result[i].id,
                                title: result[i].metaData.title,
                            });
                        }
                    }
                }
            });

        }

    }, true);
    $scope.setTable2 = function(table) {
        if (table === -1) {
            $scope.table2 = {};
        } else {
            $scope.table2 = $scope.tables2[table];

        }
    };
    $scope.setIG2 = function(ig) {
        if (ig) {
            IgDocumentService.getOne(ig.id).then(function(igDoc) {
                SegmentLibrarySvc.getSegmentsByLibrary(igDoc.profile.segmentLibrary.id).then(function(segments) {
                    DatatypeLibrarySvc.getDatatypesByLibrary(igDoc.profile.datatypeLibrary.id).then(function(datatypes) {
                        TableLibrarySvc.getTablesByLibrary(igDoc.profile.tableLibrary.id).then(function(tables) {
                            $scope.tables2 = [];
                            $scope.table2 = "";
                            if (igDoc) {
                                //$scope.segList2 = angular.copy(segments);
                                //$scope.segList2 = orderByFilter($scope.segList2, 'name');
                                //$scope.dtList2 = angular.copy(datatypes);
                                $scope.tableList2 = angular.copy(tables);
                                //$scope.messages2 = orderByFilter(igDoc.profile.messages.children, 'name');
                                //$scope.segments2 = orderByFilter(segments, 'name');
                                //$scope.datatypes2 = orderByFilter(datatypes, 'name');
                                $scope.tables2 = orderByFilter(tables, 'bindingIdentifier');
                            }
                        });
                    });
                });

            });

            //$scope.messages2 = ($scope.findIGbyID(JSON.parse(ig).id)).profile.messages.children;

        }

    };

    $scope.hideVS = function(vs1, vs2) {

        if (vs2) {
            return !(vs1.name === vs2.name);
        } else {
            return false;
        }
    };
    $scope.disableVS = function(vs1, vs2) {

        if (vs2) {
            return (vs1.id === vs2.id);
        } else {
            return false;
        }
    };




    $scope.dynamicVs_params = new ngTreetableParams({
        getNodes: function(parent) {
            if ($scope.dataList !== undefined) {
                if (parent) {
                    if (parent.codes) {
                        return parent.codes;
                    }

                } else {
                    return $scope.dataList;
                }

            }
        },
        getTemplate: function(node) {
            $scope.vsTemplate = true;
            return 'valueSet_node';
        }
    });
    $scope.cmpTable = function(table1, table2) {

        $scope.loadingSelection = true;
        $scope.vsChanged = false;
        $scope.vsTemplate = false;
        $scope.dataList = CompareService.cmpValueSet(JSON.stringify(table1), JSON.stringify(table2));
        console.log("hg==========");
        console.log($scope.dataList);
        $scope.loadingSelection = false;
        if ($scope.dynamicVs_params) {
            console.log($scope.dataList);
            $scope.showDelta = true;
            $scope.status.isSecondOpen = true;
            $scope.dynamicVs_params.refresh();
        }

    };


});