/**
 * Created by haffo on 1/12/15.
 */

angular.module('igl')
.controller('ProfileListCtrl', function ($scope, $rootScope, Restangular, $http, $filter, $modal, $cookies, $timeout, userInfoService, ToCSvc, ContextMenuSvc, CloneDeleteMessageSvc, ProfileAccessSvc, ngTreetableParams, $interval, ColumnSettings) {
		$scope.loading = false;
    	$scope.uiGrid = {};
        $rootScope.igs = [];
        $scope.igContext = {
            type: 'USER'
        };

        $scope.tmpIgs = [].concat($rootScope.igs);
        $scope.error = null;
        $scope.loading = false;
        $scope.columnSettings = ColumnSettings;
//        $scope.visibleColumns = angular.copy(ColumnSettings.visibleColumns);

        $scope.options = {
            'readonly': false
        };

        $scope.igTypes = [
            {
                name: "Predefined Implementation Guides", type: 'PRELOADED'
            },
            {
                name: "User Implementation Guides", type: 'USER'
            }
        ];
        $scope.loadingProfile = false;
        $scope.toEditProfileId = null;
        $scope.verificationResult = null;
        $scope.verificationError = null;
        $scope.csWidth = null;
        $scope.predWidth = null;
        $scope.tableWidth = null;
        $scope.commentWidth = null;
        $scope.loadingSelection = false;
        $scope.accordi = {metaData: false, definition: true, igList: true, igDetails: false};

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
                return parent ? parent.fields ? parent.fields : parent.datatype ? $rootScope.datatypesMap[parent.datatype].components : parent.children : $rootScope.segment != null ? $rootScope.segment.fields : [];
            },
            getTemplate: function (node) {
                if($scope.options.readonly) {
                    return node.type === 'segment' ? 'SegmentReadTree.html' : node.type === 'field' ? 'SegmentFieldReadTree.html' : 'SegmentComponentReadTree.html';
                }else{
                    return node.type === 'segment' ? 'SegmentEditTree.html' : node.type === 'field' ? 'SegmentFieldEditTree.html' : 'SegmentComponentEditTree.html';
                }
            }
        });

        $scope.datatypesParams = new ngTreetableParams({
            getNodes: function (parent) {
                if (parent && parent != null) {

                    if (parent.datatype) {
                        var dt = $rootScope.datatypesMap[parent.datatype];
                        return dt.components;

                    } else {
                        return parent.components;
                    }
                } else {
                    if ($rootScope.datatype != null) {
                        return $rootScope.datatype.components;
                    } else {
                        return [];
                    }
                }
            },
            getTemplate: function (node) {
                if($scope.options.readonly){
                    return node.type === 'Datatype' ? 'DatatypeReadTree.html' : node.type === 'component' && !$scope.isDatatypeSubDT(node) ? 'DatatypeComponentReadTree.html' : node.type === 'component' && $scope.isDatatypeSubDT(node) ? 'DatatypeSubComponentReadTree.html' : '';
                }else {
                    return node.type === 'Datatype' ? 'DatatypeEditTree.html' : node.type === 'component' && !$scope.isDatatypeSubDT(node) ? 'DatatypeComponentEditTree.html' : node.type === 'component' && $scope.isDatatypeSubDT(node) ? 'DatatypeSubComponentEditTree.html' : '';
                }
            }
        });


        $scope.isDatatypeSubDT = function (component) {
            if ($rootScope.datatype != null) {
                for (var i = 0, len = $rootScope.datatype.components.length; i < len; i++) {
                    if ($rootScope.datatype.components[i].id === component.id)
                        return false;
                }
            }
            return true;
        };



        $rootScope.closeProfile = function(){
            $rootScope.profile = null;
            $rootScope.isEditing = false;
            $scope.selectIgTab(0);
            $rootScope.initMaps();
            $rootScope.clearChanges();
        };

        $scope.messagesParams = new ngTreetableParams({
            getNodes: function (parent) {
            	if(!parent || parent == null) {
            		if($rootScope.message != null) {
            			return $rootScope.message.children;
            		}else {
            			return [];
            		}
            	}else if(parent.type === 'segmentRef'){
            		return $rootScope.segmentsMap[parent.ref].fields;
            	}else if(parent.type === 'field'){
            		return $rootScope.datatypesMap[parent.datatype].components;
            	}else if(parent.type === 'component'){
            		return $rootScope.datatypesMap[parent.datatype].components;
            	}else if(parent.type === 'group'){
            		return parent.children;
            	}else {
            		return [];
            	}
            	
            },
            getTemplate: function (node) {
                if($scope.options.readonly){

                    if(node.type === 'segmentRef'){
                        return 'MessageSegmentRefReadTree.html';
                    }else if(node.type === 'group'){
                        return 'MessageGroupReadTree.html';
                    }else if(node.type === 'field'){
                        return 'MessageFieldViewTree.html';
                    }else if(node.type === 'component'){
                        return 'MessageComponentViewTree.html';
                    }else {
                        return 'MessageReadTree.html';
                    }
                 }else {
                    if (node.type === 'segmentRef') {
                        return 'MessageSegmentRefEditTree.html';
                    } else if (node.type === 'group') {
                        return 'MessageGroupEditTree.html';
                    } else if (node.type === 'field') {
                        return 'MessageFieldViewTree.html';
                    } else if (node.type === 'component') {
                        return 'MessageComponentViewTree.html';
                    } else {
                        return 'MessageEditTree.html';
                    }
                }
            }
//            options: {
//                initialState: 'expanded'
//            }
        });

        /**
         * init the controller
         */
        $scope.init = function () {
            $scope.igContext.igType = $scope.igTypes[1];
            $scope.loadProfiles();
            $scope.getScrollbarWidth();
            /**
             * On 'event:loginConfirmed', resend all the 401 requests.
             */
            $scope.$on('event:loginConfirmed', function (event) {
                $scope.igContext.igType = $scope.igTypes[1];
                $scope.loadProfiles();
            });

            $rootScope.$on('event:openProfileRequest', function (event, profile) {
                $scope.openProfile(profile);
            });

            $scope.$on('event:openDatatype', function (event, datatype) {
                $scope.selectDatatype(datatype); // Shoudl we open in a dialog ??
            });

            $scope.$on('event:openSegment', function (event, segment) {
                $scope.selectSegment(segment); // Shoudl we open in a dialog ??
            });

            $scope.$on('event:openMessage', function (event, message) {
                $scope.selectMessage(message); // Shoudl we open in a dialog ??
            });

            $scope.$on('event:openTable', function (event, table) {
                $scope.selectTable(table); // Shoudl we open in a dialog ??
            });
        };

        $rootScope.$on('event:IgsPushed', function (event, profile) {
            if ($scope.igContext.igType.type === 'USER') {
                $rootScope.igs.push(profile);
            } else {
                $scope.igContext.igType = $scope.igTypes[1];
                $scope.loadProfiles();
                profile = $scope.findOne(profile.id);
            }
        });

        $scope.loadProfiles = function () {
            $scope.error = null;
//            $rootScope.igs = [];
//            $scope.tmpIgs = [].concat($rootScope.igs);
            if (userInfoService.isAuthenticated() && !userInfoService.isPending()) {
                $scope.loading = true;
                if ($scope.igContext.igType.type === 'PRELOADED') {
                    $http.get('api/profiles', {timeout: 60000}).then(function (response) {
                        $rootScope.igs.concat(angular.fromJson(response.data));
                        $scope.tmpIgs = [].concat($rootScope.igs);
                        $scope.loading = false;
                    }, function (error) {
                        $scope.loading = false;
                        $scope.error = "Failed to load the profiles";
                    });
                } else if ($scope.igContext.igType.type === 'USER') {
                    $http.get('api/profiles/cuser', {timeout: 60000}).then(function (response) {
                        $rootScope.igs.concat(angular.fromJson(response.data));
                        $scope.tmpIgs = [].concat($rootScope.igs);
                        $scope.loading = false;
                    }, function (error) {
                        $scope.loading = false;
                        $scope.error = "Failed to load the profiles";
                    });
                }

            }
        };

        $scope.clone = function (profile) {
            $scope.toEditProfileId = profile.id;
            waitingDialog.show('Cloning profile...', {dialogSize: 'sm', progressType: 'info'});
            $http.post('api/profiles/' + profile.id + '/clone', {timeout: 60000}).then(function (response) {
                $scope.toEditProfileId = null;
                if ($scope.igContext.igType.type === 'USER') {
                    $rootScope.igs.concat(angular.fromJson(response.data));
                } else {
                    $scope.igContext.igType = $scope.igTypes[1];
                    $scope.loadProfiles();
                }
                waitingDialog.hide();
            }, function (error) {
                $scope.toEditProfileId = null;
                waitingDialog.hide();
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

        $scope.show = function (profile) {
            $scope.toEditProfileId = profile.id;
            try {
                if ($rootScope.profile != null && $rootScope.profile === profile) {
                    $scope.openProfile(profile);
                } else if ($rootScope.profile && $rootScope.profile != null && $rootScope.hasChanges()) {
                    $scope.confirmOpen(profile);
                    $scope.toEditProfileId = null;
                } else {
                    $scope.openProfile(profile);
                }
            } catch (e) {
                $rootScope.msg().text = "igInitFailed";
                $rootScope.msg().type = "danger";
                $rootScope.msg().show = true;
                $scope.loadingProfile = false;
                $scope.toEditProfileId = null;
            }
        };

        $scope.edit = function (profile) {
            $scope.options.readonly = false;
            $scope.show(profile);
        };

        $scope.view = function (profile) {
            $scope.options.readonly = true;
            $scope.show(profile);
        };

        $scope.openProfile = function (profile) {
            $timeout(function() {
                if (profile != null) {
                    $scope.selectIgTab(1);
                    $scope.loadingProfile = true;
                    $rootScope.isEditing = true;
                    $scope.selectIgTab(1);
                    $rootScope.profile = profile;
                    $rootScope.profile.messages.children = $filter('orderBy')($rootScope.profile.messages.children, 'label');
                    $rootScope.profile.segments.children = $filter('orderBy')($rootScope.profile.segments.children, 'label');
                    $rootScope.profile.datatypes.children = $filter('orderBy')($rootScope.profile.datatypes.children, 'label');
                    $rootScope.profile.tables.children = $filter('orderBy')($rootScope.profile.tables.children, 'label');
                    $rootScope.tocData = ToCSvc.getToC($scope.profile);
                    $rootScope.initMaps();
                    $rootScope.messages = $rootScope.profile.messages.children;
                    angular.forEach($rootScope.profile.datatypes.children, function (child) {
                        this[child.id] = child;
                        if (child.displayName) { // TODO: Change displayName to label
                            child.label = child.displayName;
                        }
                    }, $rootScope.datatypesMap);
                    angular.forEach($rootScope.profile.segments.children, function (child) {
                        this[child.id] = child;
                        if (child.displayName) { // TODO: Change displayName to label
                            child.label = child.displayName;
                        }
                    }, $rootScope.segmentsMap);

                    angular.forEach($rootScope.profile.tables.children, function (child) {
                        this[child.id] = child;
                        if (child.displayName) { // TODO: Change displayName to label
                            child.label = child.displayName;
                        }
                        angular.forEach(child.codes, function (code) {
                            if (code.displayName) { // TODO: Change displayName to label
                                code.label = code.displayName;
                            }
                        });
                    }, $rootScope.tablesMap);

                    $rootScope.segments = [];
                    $rootScope.tables = $rootScope.profile.tables.children;
                    $rootScope.datatypes = $rootScope.profile.datatypes.children;

                    angular.forEach($rootScope.profile.messages.children, function (child) {
                        this[child.id] = child;
                        angular.forEach(child.children, function (segmentRefOrGroup) {
 // FIXME gcr: Commented because an error is being thrown.  
//                        	$rootScope.processElement(segmentRefOrGroup);
                        });
                    }, $rootScope.messagesMap);

                    if (!$rootScope.config || $rootScope.config === null) {
                        $http.get('api/profiles/config').then(function (response) {
                            $rootScope.config = angular.fromJson(response.data);
                            $scope.loadingProfile = false;
                            $scope.toEditProfileId = null;
                            $scope.selectMetaData();
                        }, function (error) {
                            $scope.loadingProfile = false;
                            $scope.toEditProfileId = null;
                        });
                    } else {
                        $scope.loadingProfile = false;
                        $scope.toEditProfileId = null;
                        $scope.selectMetaData();
                    }
                }
            },100);
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

        $scope.confirmOpen = function (profile) {
            var modalInstance = $modal.open({
                templateUrl: 'ConfirmProfileOpenCtrl.html',
                controller: 'ConfirmProfileOpenCtrl',
                resolve: {
                    profileToOpen: function () {
                        return profile;
                    }
                }
            });
            modalInstance.result.then(function (profile) {
                $scope.openProfile(profile);
            }, function () {
            });
        };


        $scope.exportAs = function (id, format) {
            var form = document.createElement("form");
            form.action = $rootScope.api('api/profiles/' + id + '/export/' + format + '/true');
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

        $scope.exportDelta = function (id, format) {
            var form = document.createElement("form");
            form.action = $rootScope.api('api/profiles/' + id + '/delta/' + format);
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
                $scope.confirmClose();
            } else {
                waitingDialog.show('Closing profile...', {dialogSize: 'sm', progressType: 'info'});
                $rootScope.closeProfile();
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
                var found = $scope.findOne($rootScope.profile.id);
                if (found != null) {
                    var index = $rootScope.igs.indexOf(found);
                    if (index > 0) {
                        $rootScope.igs [index] = $rootScope.profile;
                    }
                }
                $rootScope.msg().text = "igSaveSuccess";
                $rootScope.msg().type = "success";
                $rootScope.msg().show = true;
                $rootScope.clearChanges();
                waitingDialog.hide();
            }, function (error) {
                $scope.error = error;
                $rootScope.msg().text = "igSaveFailed";
                $rootScope.msg().type = "danger";
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
             $rootScope.changes = {};
             $rootScope.closeProfile();
        };


        $scope.initProfile = function () {
            $scope.loading = true;
            if ($rootScope.profile != null && $rootScope.profile != undefined)
                $scope.gotoSection($rootScope.profile.metaData, 'metaData');
            $scope.loading = false;

        };

        $scope.createGuide = function () {
            $scope.isVersionSelect = true;
        };

        $scope.listHL7Versions = function () {
            var hl7Versions = [];
            $http.get('api/profiles/hl7/findVersions', {
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
            $scope.subview = "EditSegments.html";
            if (segment && segment != null) {
                $scope.loadingSelection = true;
                $rootScope.segment = segment;
                $rootScope.segment["type"] = "segment";
                $timeout(
                    function () {
                        $scope.tableWidth = null;
                        $scope.scrollbarWidth = $scope.getScrollbarWidth();
                        $scope.csWidth = $scope.getDynamicWidth(1, 3, 990);
                        $scope.predWidth = $scope.getDynamicWidth(1, 3, 990);
                        $scope.commentWidth = $scope.getDynamicWidth(1, 3, 990);
                        if ($scope.segmentsParams)
                            $scope.segmentsParams.refresh();
                        $scope.loadingSelection = false;
                    }, 100);
            }
        };

        $scope.selectMetaData = function () {
            $scope.subview = "EditMetadata.html";
                 $scope.loadingSelection = true;
                $timeout(
                    function () {
                        $scope.loadingSelection = false;
                    }, 100);
        };

        $scope.selectDatatype = function (datatype) {
            $scope.subview = "EditDatatypes.html";
            if (datatype && datatype != null) {
                $scope.loadingSelection = true;
                $rootScope.datatype = datatype;
                $rootScope.datatype["type"] = "datatype";
                $timeout(
                    function () {
                        $scope.tableWidth = null;
                        $scope.scrollbarWidth = $scope.getScrollbarWidth();
                        $scope.csWidth = $scope.getDynamicWidth(1, 3, 890);
                        $scope.predWidth = $scope.getDynamicWidth(1, 3, 890);
                        $scope.commentWidth = $scope.getDynamicWidth(1, 3, 890);
                        if ($scope.datatypesParams)
                            $scope.datatypesParams.refresh();
                        $scope.loadingSelection = false;
                    }, 100);
            }
        };

        $scope.selectMessage = function (message) {
            $scope.subview = "EditMessages.html";
            $scope.loadingSelection = true;
            $rootScope.message = message;
            $timeout(
                function () {
                    $scope.tableWidth = null;
                    $scope.scrollbarWidth = $scope.getScrollbarWidth();
                    $scope.csWidth = $scope.getDynamicWidth(1, 3, 630);
                    $scope.predWidth = $scope.getDynamicWidth(1, 3, 630);
                    $scope.commentWidth = $scope.getDynamicWidth(1, 3, 630);
                    if ($scope.messagesParams)
                        $scope.messagesParams.refresh();
                    $scope.loadingSelection = false;
                }, 100);
        };

        $scope.selectTable = function (table) {
            $scope.subview = "EditValueSets.html";
            $scope.loadingSelection = true;
            $timeout(
                function () {
                    $rootScope.table = table;
                    $rootScope.codeSystems = [];
                    
                    for (var i = 0; i < $rootScope.table.codes.length; i++) {
                    	if($rootScope.codeSystems.indexOf($rootScope.table.codes[i].codeSystem) < 0){
                    		if($rootScope.table.codes[i].codeSystem && $rootScope.table.codes[i].codeSystem !== ''){
                    			$rootScope.codeSystems.push($rootScope.table.codes[i].codeSystem);
                    		}
            			}
                	}
                    $scope.loadingSelection = false;
                }, 100);
        };


        $scope.getTableWidth = function () {
            if ($scope.tableWidth === null || $scope.tableWidth == 0) {
                $scope.tableWidth = $("#nodeDetailsPanel").width();
            }
            return $scope.tableWidth;
        };

        $scope.getDynamicWidth = function (a, b, otherColumsWidth) {
            var tableWidth = $scope.getTableWidth();
            if (tableWidth > 0) {
                var left = tableWidth - otherColumsWidth;
                return {"width": a * parseInt(left / b) + "px"};
            }
            return "";
        };


        $scope.getConstraintAsString = function (constraint) {
            return constraint.constraintId + " - " + constraint.description;
        };
        
        $scope.getConformanceStatementAsString = function (constraint) {
            return "[" + constraint.constraintId + "]" + constraint.description;
        };
        
        $scope.getPredicateAsString = function (constraint) {
            return constraint.description;
        };

        $scope.getConstraintsAsString = function (constraints) {
            var str = '';
            for (var index in constraints) {
                str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
            }
            return str;
        };

        $scope.getPredicatesAsMultipleLinesString = function (node) {
            var html = "";
            angular.forEach(node.predicates, function (predicate) {
                html = html + "<p>" + predicate.description + "</p>";
            });
            return html;
        };

        $scope.getPredicatesAsOneLineString = function (node) {
            var html = "";
            angular.forEach(node.predicates, function (predicate) {
                html = html + predicate.description;
            });
            return $sce.trustAsHtml(html);
        };


        $scope.getConfStatementsAsMultipleLinesString = function (node) {
            var html = "";
            angular.forEach(node.conformanceStatements, function (conStatement) {
                html = html + "<p>" + conStatement.id + " : " + conStatement.description + "</p>";
            });
            return html;
        };

        $scope.getConfStatementsAsOneLineString = function (node) {
            var html = "";
            angular.forEach(node.conformanceStatements, function (conStatement) {
                html = html + conStatement.id + " : " + conStatement.description;
            });
            return $sce.trustAsHtml(html);
        };

        $scope.getSegmentRefNodeName = function (node) {
          return node.position + "." + $rootScope.segmentsMap[node.ref].name + ":" + $rootScope.segmentsMap[node.ref].description;
        };

        $scope.getGroupNodeName = function (node) {
            return node.position + "." + node.name;
        };

        $scope.getFieldNodeName = function (node) {
            return node.position + "." + node.name;
        };

        $scope.getComponentNodeName = function (node) {
            return node.position + "." + node.name;
        };

        $scope.getDatatypeNodeName = function (node) {
            return node.position + "." + node.name;
        };

        $scope.onColumnToggle = function (item) {
           $scope.columnSettings.save();
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


angular.module('igl').controller( 'ConfirmProfileDeleteCtrl', function ($scope, $modalInstance, profileToDelete, $rootScope, $http) {
    $scope.profileToDelete = profileToDelete;
    $scope.loading = false;
    $scope.delete = function () {
        $scope.loading = true;
        $http.post($rootScope.api('api/profiles/' + $scope.profileToDelete.id + '/delete'), {timeout: 60000}).then(function (response) {
            var index = $rootScope.igs.indexOf($scope.profileToDelete);
            if (index > -1) $rootScope.igs.splice(index, 1);
            $rootScope.backUp = null;
            if ($scope.profileToDelete === $rootScope.profile) {
                $rootScope.closeProfile();
             }
            $rootScope.msg().text = "igDeleteSuccess";
            $rootScope.msg().type = "success";
            $rootScope.msg().show = true;
            $rootScope.manualHandle = true;
            $scope.profileToDelete = null;
            $scope.loading = false;

            $modalInstance.close($scope.profileToDelete);

        }, function (error) {
            $scope.error = error;
            $scope.loading = false;
            $modalInstance.close($scope.profileToDelete);
            $rootScope.msg().text = "igDeleteFailed";
            $rootScope.msg().type = "danger";
            $rootScope.msg().show = true;

// waitingDialog.hide();
        });
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});


angular.module('igl').controller('ConfirmProfileCloseCtrl', function ($scope, $modalInstance, $rootScope, $http) {
    $scope.loading = false;
    $scope.discardChangesAndClose = function () {
        $scope.loading = true;
        $http.get('api/profiles/' + $rootScope.profile.id, {timeout: 60000}).then(function (response) {
            var index = $rootScope.igs.indexOf($rootScope.profile);
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
        $rootScope.closeProfile();
        $modalInstance.close();
    };

    $scope.saveChangesAndClose = function () {
        $scope.loading = true;
        var changes = angular.toJson($rootScope.changes);
        var data = {"changes": changes, "profile": $rootScope.profile};
        $http.post('api/profiles/' + $rootScope.profile.id + '/save', data, {timeout: 60000}).then(function (response) {
            var saveResponse = angular.fromJson(response.data);
            $rootScope.profile.metaData.date = saveResponse.date;
            $rootScope.profile.metaData.version = saveResponse.version;
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


angular.module('igl').controller('ConfirmProfileOpenCtrl', function ($scope, $modalInstance, profileToOpen, $rootScope, $http) {
    $scope.profileToOpen = profileToOpen;
    $scope.loading = false;
    $scope.discardChangesAndOpen = function () {
        $scope.loading = true;
        $http.get('api/profiles/' + $rootScope.profile.id, {timeout: 60000}).then(function (response) {
            var index = $rootScope.igs.indexOf($rootScope.profile);
            $rootScope.igs[index] = angular.fromJson(response.data);
            $scope.loading = false;
            $modalInstance.close($scope.profileToOpen);
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
        var data = {"changes": changes, "profile": $rootScope.profile};
        $http.post('api/profiles/' + $rootScope.profile.id + '/save', data, {timeout: 60000}).then(function (response) {
            var saveResponse = angular.fromJson(response.data);
            $rootScope.profile.metaData.date = saveResponse.date;
            $rootScope.profile.metaData.version = saveResponse.version;
            $scope.loading = false;
            $modalInstance.close($scope.profileToOpen);
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
