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
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Constant;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;

public class DatatypeRespositoryImpl implements DatatypeOperations {

	private Logger log = LoggerFactory.getLogger(DatatypeRespositoryImpl.class);

	@Autowired
	private MongoOperations mongo;

	@Override
	public List<Datatype> findByLibrary(String dtLibId, Constant.QUANTUM quantum) {
 	    Criteria where = Criteria.where("dtLibId").in(dtLibId);
		Query qry = Query.query(where);
		switch (quantum) {
		case BREVIS:
			qry = set4Brevis(qry);
			break;
		case SUMMA:
			break;
		}
		return mongo.find(qry, Datatype.class);
	}
	
	@Override
	public List<Datatype> findAll(Constant.QUANTUM quantum) {
		Query qry = new Query();
		switch (quantum) {
		case BREVIS:
			qry = set4Brevis(qry);
			break;
		case SUMMA:
			break;
		}
		return mongo.find(qry, Datatype.class);
	}
	
	@Override
	public Datatype findById(String id, Constant.QUANTUM quantum) {
 	    Criteria where = Criteria.where("id").is(id);
		Query qry = new Query(where);
		switch (quantum) {
		case BREVIS:
			qry = set4Brevis(qry);
			break;
		case SUMMA:
			break;
		}
		Datatype datatype = null;
		List<Datatype> datatypes = mongo.find(qry, Datatype.class);
		if (datatypes != null && datatypes.size() > 0) {
			datatype = datatypes.get(0);
		}
		return datatype;
	}
	
	Query set4Brevis(Query qry) {
		qry.fields().include("_id");
		qry.fields().include("label");
		qry.fields().include("status");
		qry.fields().include("description");
		return qry;
	}
}
