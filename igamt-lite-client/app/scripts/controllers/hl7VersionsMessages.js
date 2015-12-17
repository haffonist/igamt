angular.module('igl').controller(
		'HL7VersionsDlgCtrl',
		function($scope, $rootScope, $modal, $log, $http, $httpBackend,
				ProfileAccessSvc) {

			$rootScope.clickSource = {};

			$scope.hl7Versions = function(clickSource) {
				$rootScope.clickSource = clickSource;
				var hl7VersionsInstance = $modal.open({
					templateUrl : 'hl7VersionsDlg.html',
					controller : 'HL7VersionsInstanceDlgCtrl',
					resolve : {
						hl7Versions : function() {
							return $scope.listHL7Versions();
						}
					}
				});

				hl7VersionsInstance.result.then(function(result) {
					var hl7Version = $rootScope.hl7Version;
					switch ($rootScope.clickSource) {
					case "btn": {
						$scope.createProfile(hl7Version, result);
						$rootScope.hl7Version = null;
						break;
					}
					case "ctx": {
						$scope.updateProfile(result);
						break;
					}
					}
				});
			};

			$scope.listHL7Versions = function() {
				var hl7Versions = [];
				$http.get('api/profiles/hl7/findVersions', {
					timeout : 60000
				}).then(function(response) {
					var len = response.data.length;
					for (var i = 0; i < len; i++) {
						hl7Versions.push(response.data[i]);
					}
				});
				return hl7Versions;
			};

			/**
			 * TODO: Handle error from server
			 * 
			 * @param msgIds
			 */
			$scope.createProfile = function(hl7Version, msgIds) {
				console.log("Creating profile...");
				var iprw = {
					"hl7Version" : hl7Version,
					"msgIds" : msgIds,
					"timeout" : 60000
				};
				$http.post('api/profiles/hl7/createIntegrationProfile', iprw)
						.then(
								function(response) {
									var profile = angular
											.fromJson(response.data);
									$rootScope
											.$broadcast(
													'event:openProfileRequest',
													profile);
									$rootScope.$broadcast('event:IgsPushed',
											profile);
								});
				return $scope.profile;
			};

			/**
			 * TODO: Handle error from server
			 * 
			 * @param msgIds
			 */
			$scope.updateProfile = function(msgIds) {
				console.log("Updating profile...");
				var iprw = {
					"profile" : $rootScope.profile,
					"msgIds" : msgIds,
					"timeout" : 60000
				};
				$http.post('api/profiles/hl7/updateIntegrationProfile', iprw)
						.then(
								function(response) {
									var profile = angular
											.fromJson(response.data);
									$rootScope
											.$broadcast(
													'event:openProfileRequest',
													profile);
								});
			};

			$scope.closedCtxMenu = function(node, $index) {
				console.log("closedCtxMenu");
			};

		});

angular.module('igl').controller(
		'HL7VersionsInstanceDlgCtrl',
		function($scope, $rootScope, $modalInstance, $http, hl7Versions,
				ProfileAccessSvc) {

			$scope.selected = {
				item : hl7Versions[0]
			};

			console.log("$scope.profileVersions init");
			$scope.profileVersions = [];
			var profileVersions = [];

			$scope.loadProfilesByVersion = function() {
				$rootScope.hl7Version = $scope.hl7Version;
				console.log("loadProfilesByVersion.hl7Version=" + $scope.hl7Version);
				console.log("loadProfilesByVersion.profileVersions=" + $scope.profileVersions);
				$http.post(
						'api/profiles/hl7/messageListByVersion', angular.fromJson({
							"hl7Version" : "2.7",
							"messageIds" : $scope.profileVersions
						})).then(function(response) {
					$scope.messagesByVersion = angular.fromJson(response.data);
					console.log("loadProfilesByVersion.messagesByVersion=" + $scope.messagesByVersion);
					});
				};

			$scope.trackSelections = function(bool, id) {
				console.log("trackSelections=" + id);
				if (bool) {
					profileVersions.push(id);
				} else {
					for (var i = 0; i < profileVersions.length; i++) {
						if (profileVersions[i].id == id) {
							profileVersions.splice(i, 1);
						}
					}
				}
			};

			$scope.$watch(function() {
				return $rootScope.profile
			}, function(newValue, oldValue) {
				if ($rootScope.clickSource === "ctx") {
					$scope.hl7Version = newValue.metaData.hl7Version;
					// TODO gcr move this pluck capability to ProfileAccessSvc.
//					$scope.profileVersions = _.pluck(
//							$rootScope.profile.messages.children, 'id');
					$scope.profileVersions = ProfileAccessSvc.Messages($rootScope.profile).getMessageIds();
					console.log("$watch.profileVersions=" + $scope.profileVersions);
					$scope.loadProfilesByVersion();
				}
			});

			$scope.getHL7Version = function() {
				return ProfileAccessSvc.getVersion($rootScope.profile);
			};

			$scope.hl7Versions = hl7Versions;
			$scope.ok = function() {
				console.log("ok-profileVersions=" + profileVersions);
				$scope.profileVersions = profileVersions;
				$modalInstance.close(profileVersions);
			};

			$scope.cancel = function() {
				$modalInstance.dismiss('cancel');
			};
		});
