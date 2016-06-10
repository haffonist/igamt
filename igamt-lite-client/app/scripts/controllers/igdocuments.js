/**
 * Created by haffo on 1/12/15.
 */

angular.module('igl')
    .controller('IGDocumentListCtrl', function ($scope, $rootScope, $templateCache, Restangular, $http, $filter, $modal, $cookies, $timeout, userInfoService, ToCSvc, ContextMenuSvc, ProfileAccessSvc, ngTreetableParams, $interval, ViewSettings, StorageService, $q, Notification, DatatypeService, SegmentService, IgDocumentService, ElementUtils, AutoSaveService, DatatypeLibrarySvc, SegmentLibrarySvc, TableLibrarySvc, TableService, MastermapSvc, MessageService, FilteringSvc) {
        $scope.loading = false;
        $scope.uiGrid = {};
        $rootScope.igs = [];
        $rootScope.currentData = null;
        $scope.tmpIgs = [].concat($rootScope.igs);
        $scope.error = null;
        $scope.print = function (param) {
            console.log(param);
        }
        $scope.loading = false;
        $scope.viewSettings = ViewSettings;
        $scope.igDocumentMsg = {};
        $scope.igDocumentConfig = {
            selectedType: null
        }

        $scope.nodeReady = true;
        $scope.igDocumentTypes = [
            {
                name: "Browse Existing Preloaded Implementation Guides", type: 'PRELOADED'
            },
            {
                name: "Access My implementation guides", type: 'USER'
            }
        ];
        $scope.loadingIGDocument = false;
        $scope.toEditIGDocumentId = null;
        $scope.verificationResult = null;
        $scope.verificationError = null;
        $scope.loadingSelection = false;
        $scope.accordi = {metaData: false, definition: true, igList: true, igDetails: false};
        $rootScope.autoSaving = false;
//        AutoSaveService.stop();
        $rootScope.saved = false;

     
        
        $scope.selectIgTab = function (value) {
            if (value === 1) {
                $scope.accordi.igList = false;
                $scope.accordi.igDetails = true;
            } else {
                $scope.accordi.igList = true;
                $scope.accordi.igDetails = false;
            }
        };

        $scope.segmentsParams = new ngTreetableParams({
            getNodes: function (parent) {
                return SegmentService.getNodes(parent, $rootScope.segment);
            },
            getTemplate: function (node) {
                return SegmentService.getTemplate(node, $rootScope.segment);
            }
        });

        $scope.datatypesParams = new ngTreetableParams({
            getNodes: function (parent) {
                return DatatypeService.getNodes(parent, $rootScope.datatype);
            },
            getTemplate: function (node) {
                return DatatypeService.getTemplate(node, $rootScope.datatype);
            }
        });

        $rootScope.closeIGDocument = function () {
            $rootScope.clearChanges();
            $rootScope.igdocument = null;
            $rootScope.isEditing = false;
            $scope.selectIgTab(0);
            $rootScope.initMaps();
            StorageService.setIgDocument(null);
        };

        $scope.getMessageParams = function () {
            return new ngTreetableParams({
                getNodes: function (parent) {
                    return MessageService.getNodes(parent, $rootScope.messageTree);
                },
                getTemplate: function (node) {
                    return MessageService.getTemplate(node, $rootScope.messageTree);
                }
            });
        };

        /**
         * init the controller
         */
        $scope.initIGDocuments = function () {
            $scope.loadIGDocuments().then(function () {
//                $timeout(function () {
//                    var igdocument = StorageService.getIgDocument();
//                    if (igdocument != null) {
//                        var found = $scope.findOne(igdocument.id);
//                        if (found != null) {
//                            $scope.selectIGDocument(igdocument);
//                        }
//                    }
//                }, 1000);
            });

            $scope.getScrollbarWidth();
            /**
             * On 'event:loginConfirmed', resend all the 401 requests.
             */
            $scope.$on('event:loginConfirmed', function (event) {
                $scope.loadIGDocuments();
            });

            $rootScope.$on('event:openIGDocumentRequest', function (event, igdocument) {
                $scope.selectIGDocument(igdocument);
            });

            $scope.$on('event:openDatatype', function (event, datatype) {

                $scope.selectDatatype(datatype); // Should we open in a dialog ??
            });

            $scope.$on('event:openSegment', function (event, segment) {
                $scope.selectSegment(segment); // Should we open in a dialog ??
            });

            $scope.$on('event:openMessage', function (event, message) {
                $rootScope.messageTree = null;
                $scope.selectMessage(message); // Should we open in a dialog ??
            });

            $scope.$on('event:openTable', function (event, table) {
                $scope.selectTable(table); // Should we open in a dialog ??
            });

            $scope.$on('event:openSection', function (event, section, referencer) {
                $scope.selectSection(section, referencer); // Should we open in a dialog ??
            });

            $scope.$on('event:openDocumentMetadata', function (event, metaData) {
                $scope.selectDocumentMetaData(metaData); // Should we open in a dialog ??
            });

            $scope.$on('event:openProfileMetadata', function (event, metaData) {
                $scope.selectProfileMetaData(metaData); // Should we open in a dialog ??
            });


            $rootScope.$on('event:IgsPushed', function (event, igdocument) {
//                console.log("event:IgsPushed=" + igdocument)
                if ($scope.igDocumentConfig.selectedType === 'USER') {
                    var idx = $rootScope.igs.findIndex(function (igd) {
                        return igd.id === igdocument.id;
                    });
                    if (idx > -1) {
                        $timeout(function () {
                            _.each($rootScope.igs, function (igd) {
                                console.log("b msgs=" + igd.metaData.title + " eq=" + (igd === igdocument));
                            });
                            $rootScope.igs.splice(idx, 1);
                            $scope.tmpIgs = [].concat($rootScope.igs);
                            _.each($scope.tmpIgs, function (igd) {
                                console.log("a msgs=" + igd.metaData.title + " eq=" + (igd === igdocument));
                                console.log("msgs=" + igd.metaData.title + " len=" + igd.profile.messages.children.length);
                            });
                        }, 100);
                        $rootScope.igs.push(igdocument);
                    } else {
                        console.log("pushed=>");
                        $rootScope.igs.push(igdocument);
                    }
                } else {
                    $scope.igDocumentConfig.selectedType = 'USER';
                    $scope.loadIGDocuments();
                }
            });

            $rootScope.$on('event:saveAndExecLogout', function (event) {
                if ($rootScope.igdocument != null) {
                    if ($rootScope.hasChanges()) {
                        $rootScope.openConfirmLeaveDlg().result.then(function () {
                            $rootScope.$emit('event:execLogout');
                        });
                    } else {
                        $rootScope.$emit('event:execLogout');
                    }
                } else {
                    $rootScope.$emit('event:execLogout');
                }
            });
        };

        $scope.selectIGDocumentType = function (selectedType) {
            //console.log("selectIGDocumentType msgs=" + selectedType.metaData.title + " len=" + selectedType.profile.messages.children.length);
            $scope.igDocumentConfig.selectedType = selectedType;
            StorageService.setSelectedIgDocumentType(selectedType);
            $scope.loadIGDocuments();
        };

        $rootScope.$on('event:loadFilter', function (event, igdocument) {
//            FilteringSvc.loadMessages(igdocument);
//            FilteringSvc.loadUsages();
        });

//        $rootScope.$on('event:loadMastermap', function (event, igdocument) {
//            MastermapSvc.parseIg(igdocument);
//        });

        $scope.selectIGDocument = function (igdocument) {
            $rootScope.igdocument = igdocument;
            $scope.openIGDocument(igdocument);
        };

        $scope.loadIGDocuments = function () {
            var delay = $q.defer();
            $scope.igDocumentConfig.selectedType = StorageService.getSelectedIgDocumentType() != null ? StorageService.getSelectedIgDocumentType() : 'USER';
            $scope.error = null;
            $rootScope.igs = [];
            $scope.tmpIgs = [].concat($rootScope.igs);
            if (userInfoService.isAuthenticated() && !userInfoService.isPending()) {
                $scope.loading = true;
                StorageService.setSelectedIgDocumentType($scope.igDocumentConfig.selectedType);
                $http.get('api/igdocuments', {params: {"type": $scope.igDocumentConfig.selectedType}}).then(function (response) {
                    $rootScope.igs = angular.fromJson(response.data);
                    $scope.tmpIgs = [].concat($rootScope.igs);
                    $scope.loading = false;
                    delay.resolve(true);
                }, function (error) {
                    $scope.loading = false;
                    $scope.error = error.data;
                    delay.reject(false);
                });
            } else {
                delay.reject(false);
            }
            return delay.promise;
        };

        $scope.clone = function (igdocument) {
            $scope.toEditIGDocumentId = igdocument.id;
            $http.post('api/igdocuments/' + igdocument.id + '/clone').then(function (response) {
                $scope.toEditIGDocumentId = null;
                if ($scope.igDocumentConfig.selectedType === 'USER') {
                    $rootScope.igs.push(angular.fromJson(response.data));
                } else {
                    $scope.igDocumentConfig.selectedType = 'USER';
                    $scope.loadIGDocuments();
                }
                $rootScope.msg().text = "igClonedSuccess";
                $rootScope.msg().type = "success";
                $rootScope.msg().show = true;
            }, function (error) {
                $scope.toEditIGDocumentId = null;
                $rootScope.msg().text = "igClonedFailed";
                $rootScope.msg().type = "danger";
                $rootScope.msg().show = true;
            });
        };

        $scope.findOne = function (id) {
            for (var i = 0; i < $rootScope.igs.length; i++) {
                if ($rootScope.igs[i].id === id) {
                    return  $rootScope.igs[i];
                }
            }
            return null;
        };

        var preventChangesLost = function () {
//            if ($rootScope.hasChanges()) {
//                if(!confirm("You have unsaved changes, Do you want to stay on the page?")) {
//                    event.preventDefault();
//                }
//            }
        }

        $scope.show = function (igdocument) {
            var process = function () {
                $scope.toEditIGDocumentId = igdocument.id;
                try {
                    $scope.openIGDocument(igdocument);
                } catch (e) {
                    $rootScope.msg().text = "igInitFailed";
                    $rootScope.msg().type = "danger";
                    $rootScope.msg().show = true;
                    $scope.loadingIGDocument = false;
                    $scope.toEditIGDocumentId = null;
                }
            };

            if ($rootScope.hasChanges()) {
                $rootScope.openConfirmLeaveDlg().result.then(function () {
                    process();
                });
            } else {
                process();
            }
        };
        $scope.displayFilteredTree= function(){
        	$scope.tocView='views/tocFilterMd.html';		
        }
        
        $scope.displayRegularTree= function(){
        	$scope.tocView='views/toc.html';
        		
        }
        $scope.filtering=false;
        $scope.goToFilter= function(){
        	$scope.filtering=true;	
        }
        $scope.goToRegular= function(){
        	$scope.filtering=false;
      		
        }
        
  
        
        $scope.edit = function (igdocument) {
            console.log("edit msgs=" + igdocument.metaData.title + " len=" + igdocument.profile.messages.children.length);
            $scope.viewSettings.setTableReadonly(false);
            $scope.tocView='views/toc.html';
            $scope.show(igdocument);
        };

        $scope.view = function (igdocument) {
            $scope.viewSettings.setTableReadonly(true);
            $scope.tocView = 'views/tocReadOnly.html';
            $scope.show(igdocument);
        };
        $scope.displayNullView= function(){
        	console.log("before");
        	console.log($rootScope.subview);
        	$rootScope.subview='Blank.html';
        	console.log("after");
        	console.log($rootScope.subview);
        }      
        
        // switcher
        
        $scope.enabled = true;
        $scope.onOff = true;
        $scope.yesNo = true;
        $scope.disabled = true;


        $scope.changeCallback = function() {
          console.log('This is the state of my model ' + $scope.enabled);
        };
        
        
//        
//        $scope.reproccess= function(igdocument){
//        	
//        	igdocument.profile.messages.children=$rootScope.selectedMessages;
//
//            for(var i =0; i<igdocument.profile.messages.children.length; i++){
//            	if(igdocument.profile.messages.children[i].children){
//            		$rootScope.segments=_.union($rootScope.segments,igdocument.profile.messages.children[i].children);
//            		console.log($rootScope.segments);
//            	}
//            	console.log($rootScope.segments);
//            }
//
//        }
        

        $scope.openIGDocument = function (igdocument) {
            if (igdocument != null) {
                $scope.selectIgTab(1);
                $timeout(function () {
                    $rootScope.TreeIgs = [];
                    $rootScope.TreeIgs.push(igdocument);
                    $rootScope.selectedMessagesIDS=[];

                    //$rootScope.getMessagesFromIDS($rootScope.selectedMessagesIDS,igdocument);
                    $rootScope.selectedMessages=angular.copy(igdocument.profile.messages.children);

                    $scope.loadingIGDocument = true;
                    $rootScope.isEditing = true;
                    $rootScope.igdocument = igdocument;
                    if (igdocument.profile.metaData.hl7Version != undefined || igdocument.profile.metaData.hl7Version != null) {
                        $rootScope.hl7Version = igdocument.profile.metaData.hl7Version;
                    }
                    //StorageService.setIgDocument($rootScope.igdocument);
                    $rootScope.initMaps(); 
                    $scope.loadSegments().then(function () {
                    	$rootScope.filteredSegmentsList=angular.copy($rootScope.segments);
                        //$rootScope.filteredSegmentsList=[];
                        $scope.loadDatatypes().then(function () {
                        	
                            $rootScope.filteredDatatypesList=angular.copy($rootScope.datatypes);
                            //$rootScope.filteredDatatypesList=[];
                            $scope.loadTables().then(function () {
                                $scope.collectMessages();
                                //$scope.sortByLabels();
//                                $scope.loadMastermap();
//                                $scope.loadFilter();
                               
                                $scope.messagesParams = $scope.getMessageParams();
                                $scope.loadIgDocumentMetaData();
                				
                				$rootScope.filteredTablesList=angular.copy($rootScope.tables);
                                //$rootScope.filteredTablesList=[];

                            }, function () {
                            });
                        }, function () {
                        });
                    }, function () {
                    });
                }, function () {
                });
            }

        };
   

        $rootScope.getMessagesFromIDS=function(selectedMessagesIDS,ig){
            $rootScope.selectedMessages=[]
        	
        }

        $scope.loadIgDocumentMetaData = function () {
            if (!$rootScope.config || $rootScope.config === null) {
                $http.get('api/igdocuments/config').then(function (response) {
                    $rootScope.config = angular.fromJson(response.data);
                    $scope.loadingIGDocument = false;
                    $scope.toEditIGDocumentId = null;
                    $scope.selectDocumentMetaData();
                }, function (error) {
                    $scope.loadingIGDocument = false;
                    $scope.toEditIGDocumentId = null;
                });
            } else {
                $scope.loadingIGDocument = false;
                $scope.toEditIGDocumentId = null;
                $scope.selectDocumentMetaData();
            }
        };

        $scope.loadDatatypes = function () {
            var delay = $q.defer();
            $rootScope.igdocument.profile.datatypeLibrary.type = "datatypes";
            DatatypeLibrarySvc.getDatatypesByLibrary($rootScope.igdocument.profile.datatypeLibrary.id).then(function (children) {
                $rootScope.datatypes = children;
                $rootScope.datatypesMap = {};
                angular.forEach(children, function (child) {
                    this[child.id] = child;
                }, $rootScope.datatypesMap);
                delay.resolve(true);
            }, function (error) {
                $rootScope.msg().text = "DatatypesLoadFailed";
                $rootScope.msg().type = "danger";
                $rootScope.msg().show = true;
                delay.reject(false);

            });
            return delay.promise;
        };

        $scope.loadSegments = function () {
            var delay = $q.defer();
            $rootScope.igdocument.profile.segmentLibrary.type = "segments";
            SegmentLibrarySvc.getSegmentsByLibrary($rootScope.igdocument.profile.segmentLibrary.id).then(function (children) {
                $rootScope.segments = children;
                $rootScope.segmentsMap = {};
                angular.forEach(children, function (child) {
                    this[child.id] = child;
                }, $rootScope.segmentsMap);
                delay.resolve(true);
            }, function (error) {
                $rootScope.msg().text = "SegmentsLoadFailed";
                $rootScope.msg().type = "danger";
                $rootScope.msg().show = true;
                delay.reject(false);
            });
            return delay.promise;
        };


        $scope.loadTables = function () {
            var delay = $q.defer();
            $rootScope.igdocument.profile.tableLibrary.type = "tables";
            TableLibrarySvc.getTablesByLibrary($rootScope.igdocument.profile.tableLibrary.id).then(function (children) {
                $rootScope.tables = children;
                $rootScope.tablesMap = {};
                angular.forEach(children, function (child) {
                    this[child.id] = child;
                }, $rootScope.tablesMap);
                delay.resolve(true);
            }, function (error) {
                $rootScope.msg().text = "TablesLoadFailed";
                $rootScope.msg().type = "danger";
                $rootScope.msg().show = true;
                delay.reject(false);
            });
            return delay.promise;

        };


        $scope.loadFilter = function () {
            $rootScope.$emit('event:loadFilter', $rootScope.igdocument);
        };

        $scope.loadMastermap = function () {
//            $rootScope.$emit('event:loadMastermap', $rootScope.igdocument);
//            MastermapSvc.parseIg($rootScope.igdocument);
        };


        $scope.collectTables = function () {
            $rootScope.tables = $rootScope.igdocument.profile.tableLibrary.children;
            $rootScope.tablesMap = {};
            angular.forEach($rootScope.igdocument.profile.tableLibrary.children, function (child) {
                this[child.id] = child;
                if (child.displayName) {
                    child.label = child.displayName;
                }
                angular.forEach(child.codes, function (code) {
                    if (code.displayName) {
                        code.label = code.displayName;
                    }
                });
            }, $rootScope.tablesMap);
        };

        $scope.collectMessages = function () {
            $rootScope.messagesMap = {};
            angular.forEach($rootScope.igdocument.profile.messages.children, function (child) {
                if (child != null) {
                    this[child.id] = child;
                    var cnt = 0;
                    angular.forEach(child.children, function (segmentRefOrGroup) {
                        $rootScope.processElement(segmentRefOrGroup);
                    });
                }
            }, $rootScope.messagesMap);
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
                    $scope.collectData($rootScope.segmentsMap[node.ref.id], segRefOrGroups, segments, datatypes);
                } else if (node.type === 'component' || node.type === 'subcomponent' || node.type === 'field') {
                    $scope.collectData($rootScope.datatypesMap[node.datatype.id], segRefOrGroups, segments, datatypes);
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

        $scope.confirmDelete = function (igdocument) {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmIGDocumentDeleteCtrl.html',
                controller: 'ConfirmIGDocumentDeleteCtrl',
                resolve: {
                    igdocumentToDelete: function () {
                        return igdocument;
                    }
                }
            });
            modalInstance.result.then(function (igdocument) {
                $scope.igdocumentToDelete = igdocument;
                var idxP = _.findIndex($rootScope.igs, function (child) {
                    return child.id === igdocument.id;
                });
                $rootScope.igs.splice(idxP, 1);
                $scope.tmpIgs = [].concat($rootScope.igs);
            });
        };

        $scope.confirmClose = function () {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmIGDocumentCloseCtrl.html',
                controller: 'ConfirmIGDocumentCloseCtrl'
            });
            modalInstance.result.then(function () {
                $rootScope.clearChanges();
            }, function () {
            });
        };

        $scope.confirmOpen = function (igdocument) {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmIGDocumentOpenCtrl.html',
                controller: 'ConfirmIGDocumentOpenCtrl',
                resolve: {
                    igdocumentToOpen: function () {
                        return igdocument;
                    }
                }
            });
            modalInstance.result.then(function (igdocument) {
                $rootScope.clearChanges();
                $scope.openIGDocument(igdocument);
            }, function () {
            });
        };


        $scope.selectMessagesForExport = function (igdocument) {
            var modalInstance = $modal.open({
                templateUrl: 'SelectMessagesForExportCtrl.html',
                controller: 'SelectMessagesForExportCtrl',
                windowClass: 'conformance-profiles-modal',
                resolve: {
                    igdocumentToSelect: function () {
                        return igdocument;
                    }
                }
            });
            modalInstance.result.then(function () {
            }, function () {
            });
        };

        $scope.addTable = function (igdocument) {
            var modalInstance = $modal.open({
                templateUrl: 'AddTableOpenCtrl.html',
                controller: 'AddTableOpenCtrl',
                windowClass: 'conformance-profiles-modal',
                resolve: {
                    igdocumentToSelect: function () {
                        return igdocument;
                    }
                }
            });
            modalInstance.result.then(function () {
            }, function () {
            });
        };

        $scope.exportAsMessages = function (id, mids) {
            var form = document.createElement("form");
            form.action = $rootScope.api('api/igdocuments/' + id + '/export/pdf/' + mids);
            form.method = "POST";
            form.target = "_target";
            var csrfInput = document.createElement("input");
            csrfInput.name = "X-XSRF-TOKEN";
            csrfInput.value = $cookies['XSRF-TOKEN'];
            form.appendChild(csrfInput);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };

        $scope.exportAs = function (format) {
            if ($rootScope.igdocument != null) {
                IgDocumentService.exportAs($rootScope.igdocument, format);

//                if (!ViewSettings.tableReadonly) {
//                    IgDocumentService.save($rootScope.igdocument).then(function (result) {
//                        IgDocumentService.exportAs($rootScope.igdocument, format);
//                    }, function (error) {
//                        $rootScope.msg().text = error.data.text;
//                        $rootScope.msg().type = error.data.type;
//                        $rootScope.msg().show = true;
//                    });
//                } else {
//                    IgDocumentService.exportAs($rootScope.igdocument, format);
//                }
            }
        };

        $scope.exportDelta = function (id, format) {
            var form = document.createElement("form");
            form.action = $rootScope.api('api/igdocuments/' + id + '/delta/' + format);
            form.method = "POST";
            form.target = "_target";
            var csrfInput = document.createElement("input");
            csrfInput.name = "X-XSRF-TOKEN";
            csrfInput.value = $cookies['XSRF-TOKEN'];
            form.appendChild(csrfInput);
            form.style.display = 'none';
            document.body.appendChild(form);
            form.submit();
        };

        $scope.close = function () {
            if ($rootScope.hasChanges()) {
                $rootScope.openConfirmLeaveDlg().result.then(function () {
                    $rootScope.closeIGDocument();
                });
            } else {
                $rootScope.closeIGDocument();
            }
        };

        $scope.gotoSection = function (obj, type) {
            $rootScope.section['data'] = obj;
            $rootScope.section['type'] = type;
        };

//        $scope.save = function () {
//            $rootScope.msg().text = null;
//            $rootScope.msg().type = null;
//            $rootScope.msg().show = false;
//            var delay = $q.defer();
//            waitingDialog.show('Saving changes...', {dialogSize: 'xs', progressType: 'success'});
//            IgDocumentService.save($rootScope.igdocument).then(function (saveResponse) {
//                var found = $scope.findOne($rootScope.igdocument.id);
//                if (found != null) {
//                    var index = $rootScope.igs.indexOf(found);
//                    if (index > 0) {
//                        $rootScope.igs [index] = $rootScope.igdocument;
//                    }
//                }
//                $rootScope.msg().text = saveResponse.text;
//                $rootScope.msg().type = saveResponse.type;
//                $rootScope.msg().show = true;
//                StorageService.setIgDocument($rootScope.igdocument);
//                $rootScope.clearChanges();
//                waitingDialog.hide();
//                delay.resolve(true);
//            }, function (error) {
//                $rootScope.msg().text = error.data.text;
//                $rootScope.msg().type = error.data.type;
//                $rootScope.msg().show = true;
//                waitingDialog.hide();
//                delay.reject(false);
//            });
//            return delay.promise;
//        };


        $scope.exportChanges = function () {
            var form = document.createElement("form");
            form.action = 'api/igdocuments/export/changes';
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
            $rootScope.changes = {};
            $rootScope.closeIGDocument();
        };


        $scope.initIGDocument = function () {
            $scope.loading = true;
            if ($rootScope.igdocument != null && $rootScope.igdocument != undefined)
                $scope.gotoSection($rootScope.igdocument.metaData, 'metaData');
            $scope.loading = false;

        };

        $scope.createGuide = function () {
            $scope.isVersionSelect = true;
        };

        $scope.listHL7Versions = function () {
            var hl7Versions = [];
            $http.get('api/igdocuments/hl7/findVersions', {
                timeout: 60000
            }).then(
                function (response) {
                    var len = response.data.length;
                    for (var i = 0; i < len; i++) {
                        hl7Versions.push(response.data[i]);
                    }
                });
            return hl7Versions;
        };

        $scope.showSelected = function (node) {
            $scope.selectedNode = node;
        };

        $scope.selectSegment = function (segment) {
            $rootScope.subview = "EditSegments.html";
            if (segment && segment != null) {
                $scope.loadingSelection = true;
                SegmentService.get(segment.id).then(function (result) {
                    $rootScope.segment = angular.copy(segment);
                    $rootScope.currentData = $rootScope.segment;
                    $rootScope.segment.ext = $rootScope.getSegmentExtension($rootScope.segment);
                    $rootScope.segment["type"] = "segment";
                    $rootScope.tableWidth = null;
                    $rootScope.scrollbarWidth = $rootScope.getScrollbarWidth();
                    $rootScope.csWidth = $rootScope.getDynamicWidth(1, 3, 990);
                    $rootScope.predWidth = $rootScope.getDynamicWidth(1, 3, 990);
                    $rootScope.commentWidth = $rootScope.getDynamicWidth(1, 3, 990);
                    $scope.loadingSelection = false;
                    if ($scope.segmentsParams)
                        $scope.segmentsParams.refresh();
                    $scope.loadingSelection = false;
                    $rootScope.$emit("event:initEditArea");
                }, function (error) {
                    $scope.loadingSelection = false;
                    $rootScope.msg().text = error.data.text;
                    $rootScope.msg().type = error.data.type;
                    $rootScope.msg().show = true;
                });
            }


        };

        $scope.selectDocumentMetaData = function () {
            $rootScope.subview = "EditDocumentMetadata.html";
            $scope.loadingSelection = true;
            $rootScope.metaData = angular.copy($rootScope.igdocument.metaData);
            $rootScope.currentData = $rootScope.igdocument;
            $timeout(
                function () {
                    $scope.loadingSelection = false;
                    $rootScope.$emit("event:initEditArea");
                }, 100);
        };

        $scope.selectProfileMetaData = function () {
            $rootScope.subview = "EditProfileMetadata.html";
            $rootScope.metaData = angular.copy($rootScope.igdocument.profile.metaData);
            $rootScope.currentData = $rootScope.igdocument.profile;
            $scope.loadingSelection = true;
            $timeout(
                function () {
                    $scope.loadingSelection = false;
                    $rootScope.$emit("event:initEditArea");
                }, 100);
        };

        $scope.selectDatatype = function (datatype) {
            $rootScope.subview = "EditDatatypes.html";
            if (datatype && datatype != null) {
                $scope.loadingSelection = true;
                DatatypeService.getOne(datatype.id).then(function (result) {
                    $rootScope.datatype = angular.copy(result);
                    $rootScope.currentData = datatype;

                    $rootScope.datatype.ext = $rootScope.getDatatypeExtension($rootScope.datatype);
                    $scope.loadingSelection = false;
                    $rootScope.datatype["type"] = "datatype";
                    $rootScope.tableWidth = null;
                    $rootScope.scrollbarWidth = $rootScope.getScrollbarWidth();
                    $rootScope.csWidth = $rootScope.getDynamicWidth(1, 3, 890);
                    $rootScope.predWidth = $rootScope.getDynamicWidth(1, 3, 890);
                    $rootScope.commentWidth = $rootScope.getDynamicWidth(1, 3, 890);
                    $scope.loadingSelection = false;
                    if ($scope.datatypesParams)
                        $scope.datatypesParams.refresh();
                    $rootScope.$emit("event:initEditArea");
                }, function (error) {
                    $scope.loadingSelection = false;
                    $rootScope.msg().text = error.data.text;
                    $rootScope.msg().type = error.data.type;
                    $rootScope.msg().show = true;
                });
            }
        };

        $scope.selectMessage = function (message) {
            $rootScope.subview = "EditMessages.html";
            $scope.loadingSelection = true;
            $rootScope.originalMessage = message;
            $rootScope.message = angular.copy(message);
            $rootScope.currentData = $rootScope.message;
            $rootScope.processMessageTree($rootScope.message);
            $timeout(
                function () {
                    $rootScope.tableWidth = null;
                    $rootScope.scrollbarWidth = $rootScope.getScrollbarWidth();
                    $rootScope.csWidth = $rootScope.getDynamicWidth(1, 3, 630);
                    $rootScope.predWidth = $rootScope.getDynamicWidth(1, 3, 630);
                    $rootScope.commentWidth = $rootScope.getDynamicWidth(1, 3, 630);
                    $scope.loadingSelection = false;
                    if ($scope.messagesParams)
                        $scope.messagesParams.refresh();
                    $rootScope.$emit("event:initEditArea");
                }, 100);
        };

        $scope.selectTable = function (t) {
            var table = angular.copy(t);
            $rootScope.subview = "EditValueSets.html";
            $scope.loadingSelection = true;
            $timeout(
                function () {
                    $rootScope.table = table;
                    $rootScope.currentData = $rootScope.table;
                    $rootScope.codeSystems = [];

                    for (var i = 0; i < $rootScope.table.codes.length; i++) {
                        if ($rootScope.codeSystems.indexOf($rootScope.table.codes[i].codeSystem) < 0) {
                            if ($rootScope.table.codes[i].codeSystem && $rootScope.table.codes[i].codeSystem !== '') {
                                $rootScope.codeSystems.push($rootScope.table.codes[i].codeSystem);
                            }
                        }
                    }
                    $scope.loadingSelection = false;
                    $rootScope.$emit("event:initEditArea");
                }, 100);
        };

        $scope.selectSection = function (section) {
        	if(section.sectionContents===null||section.sectionContents===undefined){
        		section.sectionContents="";
        		console.log(section);
        	}
            $rootScope.subview = "EditSections.html";
            $scope.loadingSelection = true;
            $timeout(
                function () {
                    $rootScope.section = angular.copy(section);
                    $rootScope.currentData = $rootScope.section;
                    $rootScope.originalSection = section;
                    $scope.loadingSelection = false;
                    $rootScope.$emit("event:initEditArea");
                }, 100);
        };

        $scope.getFullName = function () {
            if (userInfoService.isAuthenticated() === true) {
                return userInfoService.getFullName();
            }
            return '';
        };


    });

angular.module('igl').controller('ViewIGChangesCtrl', function ($scope, $modalInstance, changes, $rootScope, $http) {
    $scope.changes = changes;
    $scope.loading = false;
    $scope.exportChanges = function () {
        $scope.loading = true;
        var form = document.createElement("form");
        form.action = 'api/igdocuments/export/changes';
        form.method = "POST";
        form.target = "_target";
        form.style.display = 'none';
        form.params = document.body.appendChild(form);
        form.submit();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


angular.module('igl').controller('ConfirmIGDocumentDeleteCtrl', function ($scope, $modalInstance, igdocumentToDelete, $rootScope, $http) {
    $scope.igdocumentToDelete = igdocumentToDelete;
    $scope.loading = false;
    $scope.delete = function () {
        $scope.loading = true;
        $http.post($rootScope.api('api/igdocuments/' + $scope.igdocumentToDelete.id + '/delete')).then(function (response) {
            var index = $rootScope.igs.indexOf($scope.igdocumentToDelete);
            if (index > -1) $rootScope.igs.splice(index, 1);
            $rootScope.backUp = null;
            if ($scope.igdocumentToDelete === $rootScope.igdocument) {
                $rootScope.closeIGDocument();
            }
            $rootScope.msg().text = "igDeleteSuccess";
            $rootScope.msg().type = "success";
            $rootScope.msg().show = true;
            $rootScope.manualHandle = true;
            $scope.igdocumentToDelete = null;
            $scope.loading = false;
            $modalInstance.close($scope.igdocumentToDelete);

        }, function (error) {
            $scope.error = error;
            $scope.loading = false;
            $rootScope.msg().text = "igDeleteFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;
//            $modalInstance.dismiss('cancel');


// waitingDialog.hide();
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


angular.module('igl').controller('ConfirmIGDocumentCloseCtrl', function ($scope, $modalInstance, $rootScope, $http) {
    $scope.loading = false;
    $scope.discardChangesAndClose = function () {
        $scope.loading = true;
        $http.get('api/igdocuments/' + $rootScope.igdocument.id, {timeout: 60000}).then(function (response) {
            var index = $rootScope.igs.indexOf($rootScope.igdocument);
            $rootScope.igs[index] = angular.fromJson(response.data);
            $scope.loading = false;
            $scope.clear();
        }, function (error) {
            $scope.loading = false;
            $rootScope.msg().text = "igResetFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;

            $modalInstance.dismiss('cancel');
        });
    };

    $scope.clear = function () {
        $rootScope.closeIGDocument();
        $modalInstance.close();
    };

    $scope.ConfirmIGDocumentOpenCtrl = function () {
        $scope.loading = true;
        var changes = angular.toJson($rootScope.changes);
        var data = {"changes": changes, "igDocument": $rootScope.igdocument};
        $http.post('api/igdocuments/save', data, {timeout: 60000}).then(function (response) {
            var saveResponse = angular.fromJson(response.data);
            $rootScope.igdocument.metaData.date = saveResponse.date;
            $rootScope.igdocument.metaData.version = saveResponse.version;
            $scope.loading = false;
            $scope.clear();
        }, function (error) {
            $rootScope.msg().text = "igSaveFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;

            $scope.loading = false;
            $modalInstance.dismiss('cancel');
        });
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


angular.module('igl').controller('ConfirmIGDocumentOpenCtrl', function ($scope, $modalInstance, igdocumentToOpen, $rootScope, $http) {
    $scope.igdocumentToOpen = igdocumentToOpen;
    $scope.loading = false;

    $scope.discardChangesAndOpen = function () {
        $scope.loading = true;
        $http.get('api/igdocuments/' + $rootScope.igdocument.id, {timeout: 60000}).then(function (response) {
            var index = $rootScope.igs.indexOf($rootScope.igdocument);
            $rootScope.igs[index] = angular.fromJson(response.data);
            $scope.loading = false;
            $modalInstance.close($scope.igdocumentToOpen);
        }, function (error) {
            $scope.loading = false;
            $rootScope.msg().text = "igResetFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;

            $modalInstance.dismiss('cancel');
        });
    };

    $scope.saveChangesAndOpen = function () {
        $scope.loading = true;
        var changes = angular.toJson($rootScope.changes);
        var data = {"changes": changes, "igDocument": $rootScope.igdocument};
        $http.post('api/igdocuments/save', data, {timeout: 60000}).then(function (response) {
            var saveResponse = angular.fromJson(response.data);
            $rootScope.igdocument.metaData.date = saveResponse.date;
            $rootScope.igdocument.metaData.version = saveResponse.version;
            $scope.loading = false;
            $modalInstance.close($scope.igdocumentToOpen);
        }, function (error) {
            $rootScope.msg().text = "igSaveFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;
            $scope.loading = false;
            $modalInstance.dismiss('cancel');
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('igl').controller('DocumentMetaDataCtrl', function ($scope, $rootScope, $http, IgDocumentService) {
    $scope.saving = false;
    $scope.saved = false;

    $scope.save = function () {
        $scope.saving = true;
        $scope.saved = false;
        if ($rootScope.igdocument != null && $rootScope.metaData != null) {
            IgDocumentService.saveMetadata($rootScope.igdocument.id, $rootScope.metaData).then(function (result) {
                $scope.saving = false;
                $scope.saved = true;
                $rootScope.igdocument.metaData = angular.copy($rootScope.metaData);
                if ($scope.editForm) {
                    $scope.editForm.$setPristine();
                    $scope.editForm.$dirty = false;
                }
                $rootScope.clearChanges();
                $rootScope.msg().text = "documentMetaDataSaved";
                $rootScope.msg().type = "success";
                $rootScope.msg().show = true;

            }, function (error) {
                $scope.saving = false;
                $rootScope.msg().text = error.data.text;
                $rootScope.msg().type = error.data.type;
                $rootScope.msg().show = true;
                $scope.saved = false;

            });
        }
    };
    $scope.reset = function () {
        $scope.editForm.$dirty = false;
        $scope.editForm.$setPristine();
        $rootScope.clearChanges();
        $rootScope.metaData = angular.copy($rootScope.igdocument.metaData);
    };
});

angular.module('igl').controller('ProfileMetaDataCtrl', function ($scope, $rootScope, $http, ProfileSvc) {
    $scope.saving = false;
    $scope.saved = false;
    $scope.save = function () {
        $scope.saving = true;
        $scope.saved = false;
        if ($rootScope.igdocument != null && $rootScope.metaData != null) {
            ProfileSvc.saveMetaData($rootScope.igdocument.id, $rootScope.metaData).then(function (result) {
                $scope.saving = false;
                $scope.saved = true;
                $rootScope.igdocument.profile.metaData = angular.copy($rootScope.metaData);
                $scope.editForm.$setPristine();
                $scope.editForm.$dirty = false;
                $rootScope.clearChanges();
                $rootScope.msg().text = "messageInfrasctructureSaved";
                $rootScope.msg().type = "success";
                $rootScope.msg().show = true;

            }, function (error) {
                $scope.saving = false;
                $scope.saved = false;
                $rootScope.msg().text = error.data.text;
                $rootScope.msg().type = error.data.type;
                $rootScope.msg().show = true;
            });
        }
    };
    $scope.reset = function () {
        $scope.editForm.$dirty = false;
        $scope.editForm.$setPristine();
        $rootScope.clearChanges();
        $rootScope.metaData = angular.copy($rootScope.igdocument.profile.metaData);

    };
});


angular.module('igl').controller('SelectMessagesForExportCtrl', function ($scope, $modalInstance, igdocumentToSelect, $rootScope, $http, $cookies, ExportSvc) {
    $scope.igdocumentToSelect = igdocumentToSelect;
    $scope.xmlFormat = 'Validation';
    $scope.selectedMessagesIDs = [];
    $scope.loading = false;


    $scope.trackSelections = function (bool, id) {
        if (bool) {
            $scope.selectedMessagesIDs.push(id);
        } else {
            for (var i = 0; i < $scope.selectedMessagesIDs.length; i++) {
                if ($scope.selectedMessagesIDs[i].id == id) {
                    $scope.selectedMessagesIDs.splice(i, 1);
                }
            }
        }
    };


    $scope.exportAsZIPforSelectedMessages = function () {
        $scope.loading = true;
        ExportSvc.exportAsXMLByMessageIds($scope.igdocumentToSelect.id, $scope.selectedMessagesIDs, $scope.xmlFormat);
        $scope.loading = false;
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

angular.module('igl').controller('AddTableOpenCtrl', function ($scope, $modalInstance, igdocumentToSelect, $rootScope, $http, $cookies, TableLibrarySvc, TableService) {
    $scope.loading = false;
    $scope.igdocumentToSelect = igdocumentToSelect;
    $scope.source = '';
    $scope.selectedHL7Version = '';
    $scope.searchText = '';
    $scope.hl7Versions = [];
    $scope.hl7Tables = null;
    $scope.phinvadsTables = null;
    $scope.selectedTables = [];

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

    $scope.listHL7Versions = function () {
        return $http.get('api/igdocuments/findVersions', {
            timeout: 60000
        }).then(function (response) {
            var hl7Versions = [];
            var length = response.data.length;
            for (var i = 0; i < length; i++) {
                hl7Versions.push(response.data[i]);
            }
            $scope.hl7Versions = hl7Versions;
        });
    };

    $scope.loadTablesByVersion = function (hl7Version) {
        $scope.loading = true;
        $scope.selectedHL7Version = hl7Version;
        return $http.get('api/igdocuments/' + hl7Version + "/tables", {
            timeout: 60000
        }).then(function (response) {
            $scope.hl7Tables = response.data;
            $scope.loading = false;
        });
    };

    $scope.searchPhinvads = function (searchText) {
        $scope.loading = true;
        $scope.searchText = searchText;
        return $http.get('api/igdocuments/' + searchText + "/PHINVADS/tables", {
            timeout: 600000
        }).then(function (response) {
            $scope.phinvadsTables = response.data;
            $scope.loading = false;
        });
    }

    $scope.addTable = function (table) {
        var newTable = angular.copy(table);
        newTable.participants = [];
        newTable.bindingIdentifier = $rootScope.createNewExtension(table.bindingIdentifier);

        if (newTable.codes != undefined && newTable.codes != null && newTable.codes.length != 0) {
            for (var i = 0, len1 = newTable.codes.length; i < len1; i++) {
                newTable.codes[i].id = new ObjectId().toString();
            }
        }
        console.log(JSON.stringify(newTable));
        $scope.selectedTables.push(newTable);
    };

    $scope.deleteTable = function (table) {
        var index = $scope.selectedTables.indexOf(table);
        if (index > -1) $scope.selectedTables.splice(index, 1);
    };

    $scope.save = function () {
        for (var i = 0; i < $scope.selectedTables.length; i++) {
            var newTable = $scope.selectedTables[i];
            console.log(JSON.stringify(newTable));
            newTable.libIds.push($rootScope.igdocument.profile.tableLibrary.id);

            TableService.save(newTable).then(function (result) {
                newTable = result;
                var newLink = angular.fromJson({
                    id: newTable.id,
                    bindingIdentifier: newTable.bindingIdentifier
                });

                TableLibrarySvc.addChild($rootScope.igdocument.profile.tableLibrary.id, newLink).then(function (link) {
                    $rootScope.igdocument.profile.tableLibrary.children.splice(0, 0, newLink);
                    $rootScope.tables.splice(0, 0, newTable);
                    $rootScope.tablesMap[newTable.id] = newTable;
//                    MastermapSvc.addValueSetObject(newTable, []);

                    if ($scope.editForm) {
                        $scope.editForm.$setPristine();
                        $scope.editForm.$dirty = false;
                    }
                    $rootScope.clearChanges();
                    $rootScope.msg().text = "tableSaved";
                    $rootScope.msg().type = "success";
                    $rootScope.msg().show = true;

                }, function (error) {
                    $scope.saving = false;
                    $rootScope.msg().text = error.data.text;
                    $rootScope.msg().type = error.data.type;
                    $rootScope.msg().show = true;
                });


            }, function (error) {
                $scope.saving = false;
                $rootScope.msg().text = error.data.text;
                $rootScope.msg().type = error.data.type;
                $rootScope.msg().show = true;
            });
        }

        $modalInstance.dismiss('cancel');
    };

    function positionElements(chidren) {
        var sorted = _.sortBy(chidren, "sectionPosition");
        var start = sorted[0].sectionPosition;
        _.each(sorted, function (sortee) {
            sortee.sectionPosition = start++;
        });
        return sorted;
    }
});
