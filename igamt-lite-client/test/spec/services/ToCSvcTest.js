'use strict';

describe("toc service", function () {
	
	var ToCSvc;
	var $httpBackend;
	var profileAsString;
	var profile;
	
	beforeEach(function() {
		module('igl');
		inject(function (_ToCSvc_, $injector, $rootScope, $controller) {
			ToCSvc = _ToCSvc_;
			$httpBackend = $injector.get('$httpBackend');
			 
// Don't ask me why, but the following fixtures path MUST have "base/" prepended or it won't work.
// Also, see the "pattern" thing, which is the last element of the files array in test/karma.conf.js.			 
			 	jasmine.getJSONFixtures().fixturesPath='base/test/fixtures/profiles/';

			 	// Apparently, the URL that whenGet normally requires is not needed at this time.
			 	// We test here with version 2.7.
			 	// The following only loads our file once and not before each test.
			    $httpBackend.whenGET().respond(
			    	profileAsString = JSON.stringify(getJSONFixture('profile-2.7.json'))
			    );
			    expect(profileAsString).toBeDefined();
		});
		// We want a pristine profile for each test so state changes from one test don't pollute
		// the others.
		profile = JSON.parse(profileAsString);
	});

	it("Do we have an Introduction?", function () {
		expect(ToCSvc).toBeDefined();
		var rval = ToCSvc.getIntroduction();
		expect(rval).toBeDefined();
		expect(rval.children.length).toBe(6);
		
//		console.log(JSON.stringify(rval, null, 2));
	});
	
	it("Do we have a Use Case?", function () {
		expect(ToCSvc).toBeDefined();
		var rval = ToCSvc.getUseCase();
		expect(rval).toBeDefined();
		expect(rval.children.length).toBe(4);
		
//		console.log(JSON.stringify(rval, null, 2));
	});
	
	it("Do we get a valid entry?", function() {
//		(reference, id, label, parent, drop, children)
		var rval = ToCSvc.createEntry("AUT", "2.1", "AUT", "2", []);
		expect(rval).toBeDefined();
		expect(_.has(rval, 'id')).toBeTruthy();
		expect(_.property('id')(rval)).toBe("2.1");
		expect(_.has(rval, 'label')).toBeTruthy();
		expect(_.property('label')(rval)).toBe("AUT");
		expect(_.has(rval, 'selected')).toBeTruthy();
		expect(_.property('selected')(rval)).toBeFalsy();
		expect(_.has(rval, 'parent')).toBeTruthy();
		expect(_.property('parent')(rval)).toBe("2");
		expect(_.has(rval, 'drop')).toBeTruthy();
		expect(_.has(rval, 'children')).toBeFalsy();
	});
	
	it("Do we get valid entries?", function() {
		var rval = ToCSvc.createEntries("Messages", profile.messages.children);
		expect(rval).toBeDefined();
//		console.log("rval=" + JSON.stringify(rval, null, 2));
	});
		
	it("Do we have valid messages?", function() {
		var label = "Conformance Profiles";
		var rval = ToCSvc.getTopEntry("3.1", "3", label, profile.segments);		

		expect(_.has(rval, 'id')).toBeTruthy();
		expect(_.property('id')(rval)).toBe("3.1");
		expect(_.has(rval, "label")).toBeTruthy();
		expect(_.property("label")(rval)).toBe(label);
		expect(_.has(rval, "parent")).toBeTruthy();
		expect(_.has(rval, "drop")).toBeTruthy();
		var drops = _.property("drop")(rval);
		expect(drops).toBeDefined();
		expect(_.has(rval, "children")).toBeTruthy();
		var children  = _.property("children")(rval);
		expect(children.length).toBeGreaterThan(0);
//		console.log(JSON.stringify(children, null, 2));
//		console.log(JSON.stringify(rval, null, 2));
		expect(rval.children.length).toBeGreaterThan(0);
	});	
	
	it("Do we have valid segments?", function() {
		var label = "Segments and Field Descriptions";
		var rval = ToCSvc.getTopEntry("3.2", "3", label, profile.segments);		
//		console.log(JSON.stringify(rval));
		expect(_.has(rval, 'id')).toBeTruthy();
		expect(_.property('id')(rval)).toBe("3.2");
		expect(_.has(rval, "label")).toBeTruthy();
		expect(_.property("label")(rval)).toBe(label);
		expect(_.has(rval, "parent")).toBeTruthy();
		expect(_.has(rval, "drop")).toBeTruthy();
		var drops = _.property("drop")(rval);
		expect(drops).toBeDefined();
		expect(_.has(rval, "children")).toBeTruthy();
		var children  = _.property("children")(rval);
		expect(children.length).toBeGreaterThan(0);
//		console.log(JSON.stringify(children, null, 2));
//		console.log(JSON.stringify(rval, null, 2));
		expect(rval.children.length).toBeGreaterThan(0);
	});
	
	it("Do we have valid datatypes?", function() {
		var label = "Datatypes";
		var rval = ToCSvc.getTopEntry("5", label, profile.datatypes);
		var rval = ToCSvc.getTopEntry("3.3", "3", label, profile.datatypes);
//		console.log(JSON.stringify(rval));
		expect(_.has(rval, 'id')).toBeTruthy();
		expect(_.property('id')(rval)).toBe("3.3");
		expect(_.has(rval, "label")).toBeTruthy();
		expect(_.property("label")(rval)).toBe(label);
		expect(_.has(rval, "parent")).toBeTruthy();
		expect(_.has(rval, "drop")).toBeTruthy();
		var drops = _.property("drop")(rval);
		expect(drops).toBeDefined();
		expect(_.has(rval, "children")).toBeTruthy();
		var children  = _.property("children")(rval);
		expect(children.length).toBeGreaterThan(0);
//		console.log(JSON.stringify(children, null, 2));
//		console.log(JSON.stringify(rval, null, 2));
		expect(rval.children.length).toBeGreaterThan(0);
	});
	
	it("Do we have valid valuesets?", function() {
		var label = "Value Sets";
		var rval = ToCSvc.getTopEntry("3.4", "3", label, profile.tables);
//		console.log(JSON.stringify(rval));
		expect(_.has(rval, 'id')).toBeTruthy();
		expect(_.property('id')(rval)).toBe("3.4");
		expect(_.has(rval, "label")).toBeTruthy();
		expect(_.property("label")(rval)).toBe(label);
		expect(_.has(rval, "parent")).toBeTruthy();
		expect(_.has(rval, "drop")).toBeTruthy();
		var drops = _.property("drop")(rval);
		expect(drops).toBeDefined();
		expect(_.has(rval, "children")).toBeTruthy();
		var children  = _.property("children")(rval);
		expect(children.length).toBeGreaterThan(0);
//		console.log(JSON.stringify(children, null, 2));
//		console.log(JSON.stringify(rval, null, 2));
		expect(rval.children.length).toBeGreaterThan(0);
	});
	
	it("Do we have MessageInfrstucture with the right nestings in the right order?", function() {
		var rval = ToCSvc.getMessageInfrastructure(profile);
		expect(rval.children.length).toBe(4);
		expect(rval.children[0].id).toBe("3.1");
		expect(rval.children[1].id).toBe("3.2");
		expect(rval.children[2].id).toBe("3.3");
		expect(rval.children[3].id).toBe("3.4");
	});
	
	it("Do we have a ToC?", function() {
		var rval = ToCSvc.getToC(profile);
		expect(rval).toBeDefined();
//		console.log("ToC=" + JSON.stringify(rval, null, 2));
	});
});
