/**
 * http://usejsdoc.org/
 */
angular.module('igl').factory('DatatypeLibrarySvc', function($http, $httpBackend, userInfoService) {

	var svc = this;

	var dtLibStruct = function(scope, children) {
		this.id = null;
		this.scope = scope;
	    this.sectionDescription = null;
	    this.sectionContents = null;
		this.children = children;
	};

  svc.getHL7Versions = function() {
		return $http.get(
				'api/datatype-library/findHl7Versions')
				.then(function(response) {
//					console.log("response" + JSON.stringify(response));
					return angular.fromJson(response.data);
				});
  };

	svc.getDataTypeLibraryByScopes = function(scopes) {
		console.log("datatype-library/findByScopes scopes=" + scopes);
        return $http.post(
            'api/datatype-library/findByScopes', angular.toJson(scopes))
            .then(function(response) {
//    					console.log("response" + JSON.stringify(response));
              return angular.fromJson(response.data);
            });
	};

	svc.getDataTypeLibraryByScopesAndVersion = function(scopes, hl7Version) {
		console.log("datatype-library/findByScopesAndVersion scopes=" + scopes + " hl7Version=" + hl7Version);
        var scopesAndVersion = {
          "scopes" : scopes,
          "hl7Version" : hl7Version
        };
        return $http.post(
            'api/datatype-library/findByScopesAndVersion', angular.toJson(scopesAndVersion))
            .then(function(response) {
    					console.log("response" + JSON.stringify(response));
              return angular.fromJson(response.data);
            });
	};

  svc.getDatatypesByLibrary = function(dtLibId) {
        return $http.get(
            'api/datatype-library/' + dtLibId + '/datatypes')
            .then(function(response) {
    //					console.log("response" + JSON.stringify(response));
              return angular.fromJson(response.data);
            });
  }

	svc.append = function(fromchildren, toChildren) {
		angular.foreach(fromchildren, function(child) {
			toChildren.push(child);
		});
		return svc.datatypeLibrary;
	};

	svc.createUpdate = function(scope, children) {
		var dtlrw = new dtLibStruct(scope, sortedChildren);
	};

	svc.create = function(hl7Version, scope, name, ext) {
    var dtlcw = { "hl7Version" : hl7Version,
                  "scope" : scope,
                  "name" : name,
                  "ext" : ext,
                  "accountId" : userInfoService.getAccountID()};
		return $http.post(
			'api/datatype-library/create', dtlcw).then(function(response) {
			return angular.fromJson(response.data)});
	};

	svc.save = function(datatypeLibrary) {
		return $http.post(
			'api/datatype-library/save', angular.toJson(datatypeLibrary)).then(function(response) {
			return angular.fromJson(response.data)});
	};

	return svc;
});
