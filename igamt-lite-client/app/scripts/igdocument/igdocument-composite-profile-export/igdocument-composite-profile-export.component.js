/**
 * Created by haffo on 9/11/17.
 */

angular.module('igl').controller('SelectCompositeProfilesForExportCtrl', function ($scope, $mdDialog, igdocumentToSelect, $rootScope, $http, $cookies, ExportSvc, GVTSvc, $timeout, $window, toGVT, StorageService) {
    $scope.igdocumentToSelect = igdocumentToSelect;
    $scope.toGVT = toGVT;
    $scope.exportStep = 'MESSAGE_STEP';
    $scope.xmlFormat = 'Validation';
    $scope.selectedCompositeProfileIDs = [];
    $scope.loading = false;
    $scope.info = {text: undefined, show: false, type: null, details: null};
    $scope.redirectUrl = null;
    $scope.user = {username: StorageService.getGvtUsername(), password: StorageService.getGvtPassword()};
    $scope.appInfo = $rootScope.appInfo;
    $scope.selected = false;

    $scope.targetApps = $rootScope.appInfo.connectApps;
    $scope.targetDomains = null;

    $scope.target = {
        url: null, domain: null
    };

    $scope.newDomain = null;

    // init selection to false
    for (var i in $scope.igdocumentToSelect.profile.compositeProfiles.children) {
        var message = $scope.igdocumentToSelect.profile.compositeProfiles.children[i];
        message.selected = $scope.selected = false;
    }


    $scope.selectTargetUrl = function () {
        StorageService.set("EXT_TARGET_URL", $scope.target.url);
        $scope.loadingDomains = false;
        $scope.targetDomains = null;
        $scope.target.domain = null;
        $scope.newDomain = null;
        $scope.error = null;
    };

    $scope.selectTargetDomain = function () {
        $scope.newDomain = null;
        if ($scope.target.domain != null) {
            StorageService.set($scope.target.url+"/EXT_TARGET_DOMAIN", $scope.target.domain);
        }
    };



    $scope.trackSelections = function () {
        $scope.selected = false;
        for (var i in $scope.igdocumentToSelect.profile.compositeProfiles.children) {
            var message = $scope.igdocumentToSelect.profile.compositeProfiles.children[i];
            if (message.selected) $scope.selected = true;
        }
    };

    $scope.selectionAll = function (bool) {
        for (var i in $scope.igdocumentToSelect.profile.compositeProfiles.children) {
            var message = $scope.igdocumentToSelect.profile.compositeProfiles.children[i];
            message.selected = bool;
        }
        $scope.selected = bool;
    };

    $scope.generatedSelectedMessagesIDs = function () {
        $scope.selectedCompositeProfileIDs = [];
        for (var i in $scope.igdocumentToSelect.profile.compositeProfiles.children) {
            var message = $scope.igdocumentToSelect.profile.compositeProfiles.children[i];
            if (message.selected) {
                $scope.selectedCompositeProfileIDs.push(message.id);
            }
        }
    };

    $scope.goBack = function () {
        if ($scope.exportStep === 'LOGIN_STEP') {
            $scope.exportStep = 'MESSAGE_STEP';
        } else if($scope.exportStep === 'DOMAIN_STEP'){
            $scope.exportStep = 'LOGIN_STEP';
        } else if($scope.exportStep === 'ERROR_STEP'){
            $scope.exportStep = 'DOMAIN_STEP';
        }
    };

    $scope.login = function () {
        GVTSvc.login($scope.user.username, $scope.user.password, $scope.target.url).then(function (auth) {
            StorageService.setGvtUsername($scope.user.username);
            StorageService.setGvtPassword($scope.user.password);
            StorageService.setGVTBasicAuth(auth);
            GVTSvc.getDomains($scope.target.url).then(function (result) {
                $scope.targetDomains = result;
                var savedTargetDomain = StorageService.get($scope.target.url+"/EXT_TARGET_DOMAIN");
                if (savedTargetDomain != null) {
                    for (var targetDomain in $scope.targetDomains) {
                        if (targetDomain.domain === savedTargetDomain) {
                            $scope.target.domain = savedTargetDomain;
                            break;
                        }
                    }
                } else {
                    if ($scope.targetDomains != null && $scope.targetDomains.length == 1) {
                        $scope.target.domain = $scope.targetDomains[0].domain;
                    }
                }
                $scope.exportStep = 'DOMAIN_STEP';
                $scope.selectTargetDomain();
                $scope.loadingDomains = false;
            }, function (error) {
                $scope.loadingDomains = false;
                alert(error);
            });

        });
    };


    $scope.goNext = function () {
        if ($scope.exportStep === 'LOGIN_STEP') {
            $scope.login();
        } else if($scope.exportStep === 'DOMAIN_STEP'){
            $scope.exportToGVT();
        } else if($scope.exportStep === 'ERROR_STEP'){
            $scope.exportStep = 'DOMAIN_STEP';
        } else if($scope.exportStep === 'MESSAGE_STEP'){
            $scope.generatedSelectedMessagesIDs();
            $scope.exportStep = 'LOGIN_STEP';
        }
    };

    $scope.createNewDomain = function () {
        $scope.newDomain = {name: null, key: null, homeTitle:null};
        $scope.error = null;
        $scope.target.domain = null;
    };


    $scope.exportAsZIPforSelectedCompositeProfiles = function () {
        $scope.loading = true;
        $scope.generatedSelectedMessagesIDs();
        ExportSvc.exportAsXMLByCompositeProfileIds($scope.igdocumentToSelect.id, $scope.selectedCompositeProfileIDs, $scope.xmlFormat);
        $scope.loading = false;

    };

    $scope.cancel = function () {
        $mdDialog.hide();
    };

    $scope.showErrors = function (errorDetails) {
        $scope.exportStep = 2;
        $scope.errorDetails = errorDetails;
        $scope.tmpProfileErrors = errorDetails != null ? [].concat($scope.errorDetails.profileErrors) : [];
        $scope.tmpConstraintErrors = errorDetails != null ? [].concat($scope.errorDetails.constraintsErrors) : [];
        $scope.tmpValueSetErrors = errorDetails != null ? [].concat($scope.errorDetails.vsErrors) : [];
    };

    $scope.exportToGVT = function () {
        $scope.info.text = null;
        $scope.info.show = false;
        $scope.info.type = 'danger';
        $scope.info['details'] = null;
        var auth =  StorageService.getGVTBasicAuth();
        if($scope.target.url != null && $scope.target.domain != null && auth!= null) {
            $scope.loading = true;
            GVTSvc.exportToGVTForCompositeProfile($scope.igdocumentToSelect.id, $scope.selectedCompositeProfileIDs,auth, $scope.target.url, $scope.target.domain).then(function (map) {
                $scope.loading = false;
                var response = angular.fromJson(map.data);
                if (response.success === false) {
                    $scope.info.text = "gvtExportFailed";
                    $scope.info['details'] = response;
                    $scope.showErrors($scope.info.details);
                    $scope.info.show = true;
                    $scope.info.type = 'danger';
                } else {
                    var token = response.token;
                    $scope.exportStep =  'ERROR_STEP';
                    $scope.info.text = 'gvtRedirectInProgress';
                    $scope.info.show = true;
                    $scope.info.type = 'info';
                    $scope.redirectUrl = $scope.target.url + $rootScope.appInfo.gvtUploadTokenContext + "?x=" + encodeURIComponent(token) + "&y=" + encodeURIComponent(auth) + "&d=" + encodeURIComponent($scope.target.domain);
                    $timeout(function () {
                        $scope.loading = false;
                        $window.open($scope.redirectUrl, "_target", "", false);
                    }, 1000);
                }
            }, function (error) {
                $scope.info.text = "gvtExportFailed";
                $scope.info.show = true;
                $scope.info.type = 'danger';
                $scope.loading = false;
                $scope.exportStep =  'ERROR_STEP';
            });
        }
    };



    $scope.exportAsZIPToGVT = function () {
        $scope.loading = true;
        $scope.error = null;
        if ($scope.newDomain != null) {
            $scope.newDomain.key = $scope.newDomain.name.replace(/\s+/g, '-').toLowerCase();
            GVTSvc.createDomain(StorageService.getGvtUsername(), StorageService.getGvtPassword(), $scope.target.url, $scope.newDomain.key, $scope.newDomain.name,$scope.newDomain.homeTitle).then(function (domain) {
                $scope.loading = false;
                $scope.target.domain = $scope.newDomain.key;
                $scope.exportToGVT();
            }, function (error) {
                $scope.loading = false;
                $scope.error = error.data.text;
            });
        }else if($scope.target.url != null && $scope.target.domain != null){
            $scope.exportToGVT();
        }
    };


    if($scope.targetApps != null) {
        var savedTargetUrl = StorageService.get("EXT_TARGET_URL");
        if (savedTargetUrl && savedTargetUrl != null) {
            for (var targetApp in $scope.targetApps) {
                if (targetApp.url === savedTargetUrl) {
                    $scope.target.url = targetApp.url;
                    break;
                }
            }
        }else if($scope.targetApps.length == 1){
            $scope.target.url = $scope.targetApps[0].url;
        }
        $scope.selectTargetUrl();
    }


});
