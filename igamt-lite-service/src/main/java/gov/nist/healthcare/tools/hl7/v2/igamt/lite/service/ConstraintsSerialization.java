/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified.
 */

package gov.nist.healthcare.tools.hl7.v2.igamt.lite.service;

import java.util.Date;
import java.util.Map;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DatatypeLibrary;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DocumentMetaData;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Segment;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Table;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Constraints;

public interface ConstraintsSerialization {
	Constraints deserializeXMLToConformanceStatements(String xmlConstraints);

	Constraints deserializeXMLToPredicates(String xmlConstraints);

	String serializeConstraintsToXML(Profile profile, DocumentMetaData metadata, Date dateUpdated);

	String serializeConstraintsToXML(DatatypeLibrary datatypeLibrary);

	nu.xom.Document serializeConstraintsToDoc(Profile profile, DocumentMetaData metadata, Date dateUpdated);

	String serializeConstraintsUsingMapToXML(Profile profile, DocumentMetaData metadata,
			Map<String, Segment> segmentsMap, Map<String, Datatype> datatypesMap,
			Map<String, Table> tablesMap, Date dateUpdated);
}
