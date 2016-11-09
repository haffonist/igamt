angular
    .module('igl')
    .controller(
    'shared', ['$scope', '$http', '$rootScope', '$q', '$modal','$timeout','ngTreetableParams', 'DatatypeLibraryDocumentSvc', 'TableLibrarySvc', 'DatatypeService', 'DatatypeLibrarySvc','IGDocumentSvc', 'TableService', 'ViewSettings', 'userInfoService', 
    'blockUI','CompareService','VersionAndUseService',

        function ($scope, $http, $rootScope, $q, $modal, $timeout,ngTreetableParams, DatatypeLibraryDocumentSvc, TableLibrarySvc, DatatypeService, DatatypeLibrarySvc,IGDocumentSvc, TableService, ViewSettings, userInfoService, blockUI,CompareService,VersionAndUseService) {

            $scope.selectedTab==0;
            $scope.sharedElementView='sharedElementView';
            $scope.SharedDataTypeTree=[]
            $scope.typeOfSharing="Pending";
            $rootScope.datatype={};
            $rootScope.datatypesMap={};
            $rootScope.TablesMap={};
        $scope.datatypesParams = new ngTreetableParams({
            getNodes: function(parent) {
                return DatatypeService.getNodes(parent, $rootScope.datatype);
            },
            getTemplate: function(node) {
                return DatatypeService.getTemplate(node, $rootScope.datatype);
            }
        });
            $scope.setTypeOfSharing=function(type){
                $scope.typeOfSharing=type;
                if(type==='datatype'){
                    console.log("TOCs")
                    $scope.SharedtocView='sharedtocView.html';
                    

                }
            }
         $scope.$on('event:openDatatypeonShare', function(event, datatype) {

            $scope.selectDatatype(datatype); // Should we open in a dialog ??
        });
        
            $scope.init=function(){
                $scope.createDummyLibrary();

                $scope.SharedDataTypeTree.push( $scope.library);
            }
            
            $scope.createDummyLibrary=function(){
                console.log("coalled")
                DatatypeService.getSharedDatatypes().then(function(result){
                    console.log("result");
                    console.log(result);
                    $scope.datatypes=result;
                });

              //  $scope.datatypes=[{id:1, name:"dummy",description:"dummy"},{id:2, name:"dummy",description:"dummy"}];
                $scope.tables=[{id:3, name:"dummy",description:"dummy"},{id:4, name:"dummy",description:"dummy"}];
                $scope.library={name:"bla"};
                

            }

          function processEditDataType(data) {
            console.log("dialog not opened");
            //$rootScope.datatype=data;
            $rootScope.datatype = angular.copy(data);
            //$rootScope.datatype =result;
            $rootScope.currentData =$rootScope.datatype;
            $scope.$emit('event:openDatatypeonShare',$rootScope.datatype);
        };

        $scope.editDatatype = function(data) {
                processEditDataType(data);
  
        };

        $scope.selectDatatype = function(datatype) {
            $rootScope.Activate(datatype.id);
            $scope.Sharedsubview="EditDatatypes.html";





                                //$rootScope.datatype.ext = $rootScope.getDatatypeExtension($rootScope.datatype);
                                $scope.loadingSelection = false;
                                $rootScope.datatype["type"] = "datatype";
                                $scope.loadingSelection = false;
                                try {
                                    if ($scope.datatypesParams)
                                        $scope.datatypesParams.refresh();
                                } catch (e) {

                                }
                                $rootScope.references = [];
                                $rootScope.tmpReferences = [].concat($rootScope.references);

                                angular.forEach($rootScope.datatypes, function(dt) {
                                    if (dt && dt != null && dt.id !== $rootScope.datatype.id) $rootScope.findDatatypeRefs(datatype, dt, $rootScope.getDatatypeLabel(dt), dt);
                                });

                                $rootScope.tmpReferences = [].concat($rootScope.references);

                                $rootScope.$emit("event:initEditArea");

                            
        };
        



        }]);
          