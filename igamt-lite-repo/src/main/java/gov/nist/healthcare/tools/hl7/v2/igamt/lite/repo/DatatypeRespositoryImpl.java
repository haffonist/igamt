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
package gov.nist.healthcare.tools.hl7.v2.igamt.lite.repo;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.query.Query;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Constant;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;

public class DatatypeRespositoryImpl implements DatatypeOperations {

	private Logger log = LoggerFactory.getLogger(DatatypeRespositoryImpl.class);

	@Autowired
	private MongoOperations mongo;

	@Override
	public List<Datatype> findAll(String dtLibId, Constant.EXTENT extent) {
		Query qry = new Query();
		switch (extent) {
		case BREVIS:
			qry.fields().include("_id");
			qry.fields().include("label");
			qry.fields().include("status");
			qry.fields().include("description");
			break;
		case SUMMA:
			break;
		}
		return mongo.find(qry, Datatype.class);
	}
	
	@Override
	public List<Datatype> findAll(String dtLibId) {
		return mongo.findAll(Datatype.class);
	}
	
	@Override
	public Datatype findById(String id, Constant.EXTENT extent) {
		
	}
}
