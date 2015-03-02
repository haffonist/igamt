package gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.xml;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Usage;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.ByID;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.ByName;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.ByNameOrByID;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Constraint;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Constraints;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Context;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Reference;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;

import nu.xom.Attribute;
import nu.xom.Builder;
import nu.xom.NodeFactory;
import nu.xom.ParsingException;
import nu.xom.ValidityException;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

public class ConstraintsSerializationImpl implements ConstraintsSerialization{

	@Override
	public Constraints deserializeXMLToConformanceStatements(String xmlConstraints) {
		Document conformanceContextDoc = this.stringToDom(xmlConstraints);
		Element elmConstraints = (Element)conformanceContextDoc.getElementsByTagName("Constraints").item(0);
		Constraints constraints = new Constraints();
		
		Context datatypeContextObj = new Context();
		Context segmentContextObj = new Context();
		Context groupContextObj = new Context();
		
		this.deserializeXMLToContext((Element)elmConstraints.getElementsByTagName("Datatype").item(0), datatypeContextObj);
		this.deserializeXMLToContext((Element)elmConstraints.getElementsByTagName("Segment").item(0), segmentContextObj);
		this.deserializeXMLToContext((Element)elmConstraints.getElementsByTagName("Group").item(0), groupContextObj);
		
		
		constraints.setDatatypes(datatypeContextObj);
		constraints.setSegments(segmentContextObj);
		constraints.setGroups(groupContextObj);
		
		return constraints;
	}
	
	@Override
	public Constraints deserializeXMLToPredicates(String xmlConstraints) {
		Document conformanceContextDoc = this.stringToDom(xmlConstraints);
		Element elmConstraints = (Element)conformanceContextDoc.getElementsByTagName("Predicates").item(0);
		Constraints constraints = new Constraints();
		
		Context datatypeContextObj = new Context();
		Context segmentContextObj = new Context();
		Context groupContextObj = new Context();
		
		this.deserializeXMLToContext((Element)elmConstraints.getElementsByTagName("Datatype").item(0), datatypeContextObj);
		this.deserializeXMLToContext((Element)elmConstraints.getElementsByTagName("Segment").item(0), segmentContextObj);
		this.deserializeXMLToContext((Element)elmConstraints.getElementsByTagName("Group").item(0), groupContextObj);
		
		
		constraints.setDatatypes(datatypeContextObj);
		constraints.setSegments(segmentContextObj);
		constraints.setGroups(groupContextObj);
		
		return constraints;
	}
	
	@Override
	public String serializeConstraintsToXML(Constraints conformanceStatements, Constraints predicates) {
		return this.serializeConstraintsToDoc(conformanceStatements, predicates).toXML();
	}
	
	@Override
	public nu.xom.Document serializeConstraintsToDoc(Constraints conformanceStatements, Constraints predicates) {
		nu.xom.Element e = new nu.xom.Element("ConformanceContext");
		e.addAttribute(new Attribute("UUID", ""));
		e.addNamespaceDeclaration("xsi", "http://www.w3.org/2001/XMLSchema-instance");
		e.addAttribute(new Attribute("xsi:noNamespaceSchemaLocation", "http://www.w3.org/2001/XMLSchema-instance", "ConformanceContext.xsd"));
		
		nu.xom.Element metaData_Elm = new nu.xom.Element("MetaData");
		nu.xom.Element metaData_Description_Elm = new nu.xom.Element("Description");
		metaData_Description_Elm.appendChild("Auto Serialized Constranints XML");
		metaData_Elm.appendChild(metaData_Description_Elm);
		
		e.appendChild(metaData_Elm);
		
		nu.xom.Element predicates_Elm = new nu.xom.Element("Predicates");
		
		nu.xom.Element predicates_dataType_Elm = new nu.xom.Element("Datatype");
		for(ByNameOrByID byNameOrByIDObj: predicates.getDatatypes().getByNameOrByIDs()){
			nu.xom.Element dataTypeConstaint = this.serializeByNameOrByID(byNameOrByIDObj);
			if(dataTypeConstaint != null) predicates_dataType_Elm.appendChild(dataTypeConstaint);
		}
		predicates_Elm.appendChild(predicates_dataType_Elm);
		
		nu.xom.Element predicates_segment_Elm = new nu.xom.Element("Segment");
		for(ByNameOrByID byNameOrByIDObj: predicates.getSegments().getByNameOrByIDs()){
			nu.xom.Element segmentConstaint = this.serializeByNameOrByID(byNameOrByIDObj);
			if(segmentConstaint != null) predicates_segment_Elm.appendChild(segmentConstaint);
		}
		predicates_Elm.appendChild(predicates_segment_Elm);
		
		nu.xom.Element predicates_group_Elm = new nu.xom.Element("Group");
		for(ByNameOrByID byNameOrByIDObj: predicates.getGroups().getByNameOrByIDs()){
			nu.xom.Element groupConstaint = this.serializeByNameOrByID(byNameOrByIDObj);
			if(groupConstaint != null) predicates_group_Elm.appendChild(groupConstaint);
		}
		
		predicates_Elm.appendChild(predicates_group_Elm);
		
		e.appendChild(predicates_Elm);
		
		nu.xom.Element constraints_Elm = new nu.xom.Element("Constraints");
		
		nu.xom.Element constraints_dataType_Elm = new nu.xom.Element("Datatype");
		for(ByNameOrByID byNameOrByIDObj: conformanceStatements.getDatatypes().getByNameOrByIDs()){
			nu.xom.Element dataTypeConstaint = this.serializeByNameOrByID(byNameOrByIDObj);
			if(dataTypeConstaint != null) constraints_dataType_Elm.appendChild(dataTypeConstaint);
		}
		constraints_Elm.appendChild(constraints_dataType_Elm);
		
		nu.xom.Element constraints_segment_Elm = new nu.xom.Element("Segment");
		for(ByNameOrByID byNameOrByIDObj: conformanceStatements.getSegments().getByNameOrByIDs()){
			nu.xom.Element segmentConstaint = this.serializeByNameOrByID(byNameOrByIDObj);
			if(segmentConstaint != null) constraints_segment_Elm.appendChild(segmentConstaint);
		}
		constraints_Elm.appendChild(constraints_segment_Elm);
		
		nu.xom.Element constraints_group_Elm = new nu.xom.Element("Group");
		for(ByNameOrByID byNameOrByIDObj: conformanceStatements.getGroups().getByNameOrByIDs()){
			nu.xom.Element groupConstaint = this.serializeByNameOrByID(byNameOrByIDObj);
			if(groupConstaint != null) constraints_group_Elm.appendChild(groupConstaint);
		}
		constraints_Elm.appendChild(constraints_group_Elm);
		
		e.appendChild(constraints_Elm);
		
		return new nu.xom.Document(e);
	}
	
	private nu.xom.Element serializeByNameOrByID(ByNameOrByID byNameOrByIDObj) {
		if(byNameOrByIDObj instanceof ByName){
			ByName byNameObj = (ByName)byNameOrByIDObj;
			nu.xom.Element elmByName = new nu.xom.Element("ByName");
			elmByName.addAttribute(new Attribute("Name", byNameObj.getByName()));
			
			for(Constraint c:byNameObj.getConstraints()){
				nu.xom.Element elmConstaint = this.serializeConstaint(c);
				if(elmConstaint != null) elmByName.appendChild(elmConstaint);
			}
			
			return elmByName;
		}else if(byNameOrByIDObj instanceof ByID){
			ByID byIDObj = (ByID)byNameOrByIDObj;
			nu.xom.Element elmByID = new nu.xom.Element("ByID");
			elmByID.addAttribute(new Attribute("ID", byIDObj.getByID()));
			
			for(Constraint c:byIDObj.getConstraints()){
				nu.xom.Element elmConstaint = this.serializeConstaint(c);
				if(elmConstaint != null) elmByID.appendChild(elmConstaint);
			}

			return elmByID;
		}
		
		return null;
	}

	private nu.xom.Element serializeConstaint(Constraint c) {
		nu.xom.Element elmConstraint = new nu.xom.Element("Constraint");
		elmConstraint.addAttribute(new Attribute("ID", c.getConstraintId()));
		if(c.getConstraintTarget() != null && !c.getConstraintTarget().equals("")) elmConstraint.addAttribute(new Attribute("Target", c.getConstraintTarget()));
		if(c.getTrueUsage() != null) elmConstraint.addAttribute(new Attribute("TrueUsage", c.getTrueUsage().value()));
		if(c.getFalseUsage() != null) elmConstraint.addAttribute(new Attribute("FalseUsage", c.getFalseUsage().value()));
		if(c.getReference() != null){
			Reference referenceObj = c.getReference();
			nu.xom.Element elmReference = new nu.xom.Element("Reference");
			if(referenceObj.getChapter() != null && !referenceObj.getChapter().equals("")) elmReference.addAttribute(new Attribute("Chapter", referenceObj.getChapter()));
			if(referenceObj.getSection() != null && !referenceObj.getSection().equals("")) elmReference.addAttribute(new Attribute("Section", referenceObj.getSection()));
			if(referenceObj.getPage() == 0) elmReference.addAttribute(new Attribute("Page", "" + referenceObj.getPage()));
			if(referenceObj.getUrl() != null && !referenceObj.getUrl().equals("")) elmReference.addAttribute(new Attribute("URL", referenceObj.getUrl()));
			elmConstraint.appendChild(elmReference);
		}
		nu.xom.Element elmDescription = new nu.xom.Element("Description");
		elmDescription.appendChild(c.getDescription());
		elmConstraint.appendChild(elmDescription);
		elmConstraint.appendChild(this.innerXMLHandler(c.getAssertion()));
		
		return elmConstraint;
	}
	
	private nu.xom.Node innerXMLHandler(String xml){
		Builder builder = new Builder(new NodeFactory());
		try {
			nu.xom.Document doc = builder.build(xml, null);
			return (nu.xom.Element)doc.getRootElement().copy();
		} catch (ValidityException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (ParsingException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		return null;
	}

	private void deserializeXMLToContext(Element elmContext, Context contextObj) {
		NodeList nodes = elmContext.getChildNodes();
		
		for(int i=0; i<nodes.getLength(); i++){
			if(nodes.item(i).getNodeName().equals("ByName")){
				ByName byNameObj = new ByName();
				Element elmByName = (Element)nodes.item(i);
				byNameObj.setByName(elmByName.getAttribute("Name"));
				deserializeXMLToConstraints(elmByName, byNameObj);
				contextObj.getByNameOrByIDs().add(byNameObj);
			}else if(nodes.item(i).getNodeName().equals("ByID")){
				ByID byIDObj = new ByID();
				Element elmByID = (Element)nodes.item(i);
				byIDObj.setByID(elmByID.getAttribute("ID"));
				deserializeXMLToConstraints(elmByID, byIDObj);
				contextObj.getByNameOrByIDs().add(byIDObj);
			}
			
		}	
	}

	private void deserializeXMLToConstraints(Element elmByNameOrByID, ByNameOrByID byNameOrByIDObj) {
		NodeList constraintNodes = elmByNameOrByID.getElementsByTagName("Constraint");
		
		for(int i=0; i < constraintNodes.getLength(); i++){
			Constraint constraintObj = new Constraint();
			Element elmConstraint = (Element)constraintNodes.item(i);
			
			constraintObj.setConstraintId(elmConstraint.getAttribute("ID"));
			constraintObj.setConstraintTarget(elmConstraint.getAttribute("Target"));			
			NodeList descriptionNodes = elmConstraint.getElementsByTagName("Description");
			if(descriptionNodes != null && descriptionNodes.getLength() == 1) {
				constraintObj.setDescription(descriptionNodes.item(0).getTextContent());	
			}
			this.deserializeXMLToReference(elmConstraint, constraintObj);
			constraintObj.setAssertion(this.convertElementToString(elmConstraint.getElementsByTagName("Assertion").item(0)));	
			byNameOrByIDObj.getConstraints().add(constraintObj);
		}
		
		NodeList predicateNodes = elmByNameOrByID.getElementsByTagName("Predicate");
		
		for(int i=0; i < predicateNodes.getLength(); i++){
			Constraint predicateObj = new Constraint();
			Element elmPredicate = (Element)predicateNodes.item(i);
			
			predicateObj.setConstraintId(elmPredicate.getAttribute("ID"));
			predicateObj.setConstraintTarget(elmPredicate.getAttribute("Target"));
			predicateObj.setTrueUsage(Usage.fromValue(elmPredicate.getAttribute("TrueUsage")));
			predicateObj.setFalseUsage(Usage.fromValue(elmPredicate.getAttribute("FalseUsage")));
			NodeList descriptionNodes = elmPredicate.getElementsByTagName("Description");
			if(descriptionNodes != null && descriptionNodes.getLength() == 1) {
				predicateObj.setDescription(descriptionNodes.item(0).getTextContent());	
			}
			this.deserializeXMLToReference(elmPredicate, predicateObj);
			predicateObj.setAssertion(this.convertElementToString(elmPredicate.getElementsByTagName("Condition").item(0)));	
			byNameOrByIDObj.getConstraints().add(predicateObj);
		}
	}
	
	private String convertElementToString(Node node){
		try {
			TransformerFactory transFactory = TransformerFactory.newInstance();
			Transformer transformer = transFactory.newTransformer();
			StringWriter buffer = new StringWriter();
			transformer.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
			transformer.transform(new DOMSource(node), new StreamResult(buffer));
			
			return buffer.toString();
		} catch (TransformerException e) {
			e.printStackTrace();
		}
		
		return null;
	}
	
	private void deserializeXMLToReference(Element elmConstraint, Constraint constraintObj) {
		NodeList nodes = elmConstraint.getElementsByTagName("Reference");
		if(nodes != null && nodes.getLength() == 1) {
			Reference referenceObj = new Reference();
			Element elmReference = (Element)nodes.item(0);
			
			referenceObj.setChapter(elmReference.getAttribute("Chapter"));
			referenceObj.setPage(Integer.parseInt(elmReference.getAttribute("Page")));
			referenceObj.setSection(elmReference.getAttribute("Section"));
			referenceObj.setUrl(elmReference.getAttribute("URL"));
			
			constraintObj.setReference(referenceObj);
		}
		
	}

	private Document stringToDom(String xmlSource) {
		DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
		factory.setNamespaceAware(true);
		factory.setIgnoringComments(false);
		factory.setIgnoringElementContentWhitespace(true);
		DocumentBuilder builder;
		try {
			builder = factory.newDocumentBuilder();
			return builder.parse(new InputSource(new StringReader(xmlSource)));
		} catch (ParserConfigurationException e) {
			e.printStackTrace();
		} catch (SAXException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		}
		return null;
	}
}
