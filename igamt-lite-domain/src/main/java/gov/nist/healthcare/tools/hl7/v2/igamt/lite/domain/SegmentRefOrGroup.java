package gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain;

import javax.persistence.Entity;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;

@Entity
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
public class SegmentRefOrGroup implements java.io.Serializable {

	private static final long serialVersionUID = 1L;

}
