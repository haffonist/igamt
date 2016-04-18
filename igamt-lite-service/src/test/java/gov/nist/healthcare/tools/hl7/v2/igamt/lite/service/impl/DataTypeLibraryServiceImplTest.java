package gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.impl;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

import java.util.List;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Constant;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DatatypeLibrary;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.DatatypeLibraryService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.test.integration.PersistenceContext;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = {PersistenceContext.class})
public class DataTypeLibraryServiceImplTest {

	@Autowired
	DatatypeLibraryService dtlService;
	
	@Test
	public void testFindAll() {
		List<DatatypeLibrary> dtl = dtlService.findAll();
		assertNotNull(dtl);
	}

	@Test
	public void testFindByScopeAndVersion() {
		DatatypeLibrary dtlH = dtlService.findByScopeAndVersion(Constant.SCOPE.HL7STANDARD, "2.5.1");
		assertNotNull(dtlH);
		assertEquals(91, dtlH.getChildren().size());
		DatatypeLibrary dtlM = dtlService.findByScopeAndVersion(Constant.SCOPE.MASTER, "2.5.1");
		assertNotNull(dtlM);
		assertEquals(0, dtlM.getChildren().size());
	}
	
//	@Test
	public void saveTest() {
		List<DatatypeLibrary> dtls = dtlService.findAll();
		assertEquals(1, dtls.size());
		DatatypeLibrary dtlH;
		dtlH = dtlService.findByScopeAndVersion(Constant.SCOPE.HL7STANDARD, "2.5.1");
		assertNotNull(dtlH);
		dtlH.setId(null);
		dtlH.setScope(Constant.SCOPE.USER);
		dtlService.save(dtlH);
		dtls = dtlService.findAll();
		assertEquals(2, dtls.size());
//		DatatypeLibrary dtlU = dtlService.findByScopeAndVersion(Constant.SCOPE.USER);
//		assertNotNull(dtlU);
//		assertEquals(91, dtlU.getChildren().size());
//		assertEquals(Constant.SCOPE.USER, dtlU.getScope());
//		dtlService.delete(dtlU);
//		dtls = dtlService.findAll();
//		assertEquals(1, dtls.size());
	}
}
