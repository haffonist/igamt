/**
 * This software was developed at the National Institute of Standards and Technology by employees
 * of the Federal Government in the course of their official duties. Pursuant to title 17 Section 105 of the
 * United States Code this software is not subject to copyright protection and is in the public domain.
 * This is an experimental system. NIST assumes no responsibility whatsoever for its use by other parties,
 * and makes no guarantees, expressed or implied, about its quality, reliability, or any other characteristic.
 * We would appreciate acknowledgement if the software is used. This software can be redistributed and/or
 * modified freely provided that any derivative works bear some notice that they are derived from it, and any
 * modified versions bear some notice that they have been modified.
 */
package gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.test.integration;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;

import org.apache.log4j.PropertyConfigurator;
import org.junit.BeforeClass;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.ExpectedException;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import com.fasterxml.jackson.databind.ObjectMapper;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.IGDocumentScope;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.repo.ProfileRepository;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.ProfileCreationService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.ProfileException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.ProfileService;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {PersistenceContext.class})
public class ProfileCreationServiceTest {

	@Autowired
	ProfileRepository profileRepository;

	@Rule
	public ExpectedException thrown = ExpectedException.none();

	@Autowired
	ProfileService profileService;

	@Autowired
	ProfileCreationService profileCreation;

	
	static ProfileCreationReferentialIntegrityTest refIneteg;

	@BeforeClass
	public static void setup() {
		try {
			Properties p = new Properties();
			InputStream log4jFile = ProfileCreationServiceTest.class
					.getResourceAsStream("/igl-test-log4j.properties");
			p.load(log4jFile);
			PropertyConfigurator.configure(p);
			refIneteg = new ProfileCreationReferentialIntegrityTest();
		} catch (IOException e) {
			e.printStackTrace();
		}
	}

//	@Test
	public void testProfileStandardProfilePreloaded() {
		//FIXME for now mongo db is loaded with 2 profiles; ultimately version 2.5 until 2.8 should be preloaded
		assertEquals(9, profileCreation.findProfilesByHl7Versions().size());
	}
	
	@Test
	public void testSummary() {
		String[] arr = {"ADT", "ACK", "RCI", "QRY", "OML"};
		List<String[]> msgsAll = profileCreation.summary("2.7", new ArrayList<String>());
		List<String[]> msgsSansArr = profileCreation.summary("2.7", Arrays.asList(arr));
		
		assertTrue(msgsAll.size() > msgsSansArr.size());
	}
	
	@Test
	public void testProfileCreation() throws IOException, ProfileException {
		// Collect version numbers
		assertEquals(7, profileCreation.findHl7Versions().size());

		// Collect standard messages and message descriptions
		// There should be only one HL7STANDARD profile for each version
		for (String hl7Version : Arrays.asList("2.5.1", "2.7")) {
			int found = profileRepository.findByScopeAndMetaData_Hl7Version(IGDocumentScope.HL7STANDARD, hl7Version).size();
			assertEquals(1, found);
//			assertEquals(1, profileRepository.findByScopeAndMetaData_Hl7Version(ProfileScope.HL7STANDARD, hl7Version).size());
		}
		Profile profileSource = profileRepository.findByScopeAndMetaData_Hl7Version(IGDocumentScope.HL7STANDARD, "2.7").get(0);
		assertEquals(193, profileSource.getMessages().getChildren().size());

		// Each description has 4 items: id, event, strucId, description
		List<String[]> msgDesc = profileCreation.summary("2.7", new ArrayList<String>());
		assertEquals(4, msgDesc.get(0).length);
		
		// Creation of a profile with three message ids
		List<String> msgIds = new ArrayList<String>();
//		msgIds.add(msgDesc.get(0)[0]);
//		msgIds.add(msgDesc.get(1)[0]);
//		msgIds.add(msgDesc.get(2)[0]);
//		msgIds.add(msgDesc.get(3)[0]);
//		msgIds.add(msgDesc.get(4)[0]);
		msgIds.add("5665cee2d4c613e7b531be55");
		msgIds.add("5665cee2d4c613e7b531b7ba");
		msgIds.add("5665cee2d4c613e7b531be18");
		msgIds.add("5665cee2d4c613e7b531be4e");
		msgIds.add("5665cee2d4c613e7b531bbbb");
		Profile pNew = profileCreation.createIntegratedProfile(msgIds, "2.7", 45L);
		assertEquals(5, pNew.getMessages().getChildren().size());

		refIneteg.testMessagesVsSegments(pNew);
		refIneteg.testFieldDatatypes(pNew);
		refIneteg.testComponentDataypes(pNew);
		
		// Captures the newly created profile.
		ObjectMapper mapper = new ObjectMapper();
		File OUTPUT_DIR = new File(System.getenv("IGAMT") + "/profiles");
		File outfile = new File(OUTPUT_DIR, "profile-" + "2.7.5" + ".json");
		mapper.writerWithDefaultPrettyPrinter().writeValue(outfile, pNew);

	}
	
	@Test
	public void testProfileUpdate() throws IOException, ProfileException {
		// Collect version numbers
		assertEquals(7, profileCreation.findHl7Versions().size());

		// Collect standard messages and message descriptions
		//There should be only one HL7STANDARD profile for each version
		for (String hl7Version : Arrays.asList("2.5.1", "2.7")){
			int found = profileRepository.findByScopeAndMetaData_Hl7Version(IGDocumentScope.HL7STANDARD, hl7Version).size();
			assertEquals(1, found);
		}
		Profile profileSource = profileRepository.findByScopeAndMetaData_Hl7Version(IGDocumentScope.HL7STANDARD, "2.7").get(0);
		assertEquals(193, profileSource.getMessages().getChildren().size());

		// Each description has 4 items: id, event, strucId, description
		List<String[]> msgDesc = profileCreation.summary("2.7", new ArrayList<String>());
		assertEquals(4, msgDesc.get(0).length);
		
		// Creation of a profile with three message ids
		List<String> msgIds = new ArrayList<String>();
//		msgIds.add(msgDesc.get(0)[0]);
//		msgIds.add(msgDesc.get(1)[0]);
//		msgIds.add(msgDesc.get(2)[0]);
//		msgIds.add(msgDesc.get(3)[0]);
//		msgIds.add(msgDesc.get(4)[0]);
		msgIds.add("5665cee2d4c613e7b531be55");
		msgIds.add("5665cee2d4c613e7b531b7ba");
		msgIds.add("5665cee2d4c613e7b531be18");
		msgIds.add("5665cee2d4c613e7b531be4e");
		msgIds.add("5665cee2d4c613e7b531bbbb");
		Profile pNew = profileCreation.createIntegratedProfile(msgIds, "2.7", 45L);
		assertEquals(5, pNew.getMessages().getChildren().size());
		List<String> msgIds1 = new ArrayList<String>();
		msgIds1.add(msgDesc.get(5)[0]);
		msgIds1.add(msgDesc.get(6)[0]);
		msgIds1.add(msgDesc.get(7)[0]);
		Profile pExNew = profileCreation.updateIntegratedProfile(msgIds1, pNew);
		assertEquals(8, pExNew.getMessages().getChildren().size());

		refIneteg.testMessagesVsSegments(pExNew);
		refIneteg.testFieldDatatypes(pExNew);
		refIneteg.testComponentDataypes(pExNew);
		
		// Captures the newly updated profile.
		ObjectMapper mapper = new ObjectMapper();
		File OUTPUT_DIR = new File(System.getenv("IGAMT") + "/profiles");
		File outfile = new File(OUTPUT_DIR, "profile-" + "2.7.8" + ".json");
		mapper.writerWithDefaultPrettyPrinter().writeValue(outfile, pNew);
	}
}
