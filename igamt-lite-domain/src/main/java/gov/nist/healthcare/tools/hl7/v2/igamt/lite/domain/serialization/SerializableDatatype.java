package gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.serialization;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.*;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.ConformanceStatement;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Constraint;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.Predicate;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.exception.DatatypeNotFoundException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.exception.TableNotFoundException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.serialization.exception.ConstraintSerializationException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.serialization.exception.DatatypeComponentSerializationException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.serialization.exception.DatatypeSerializationException;
import nu.xom.Attribute;
import nu.xom.Element;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

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
 * <p>
 * Created by Maxence Lefort on 12/9/16.
 */
public class SerializableDatatype extends SerializableSection {

    private Datatype datatype;
    private List<SerializableConstraint> constraints;
    private Map<Component,Datatype> componentDatatypeMap;
    private Map<Component,List<ValueSetOrSingleCodeBinding>> componentValueSetBindingsMap;
    private String defPreText, defPostText, usageNote;
    private Map<Component,String> componentTextMap;
    private Boolean showConfLength;
    private Boolean showInnerLinks;
    private List<Table> tables;
    private String host;

    public List<SerializableConstraint> getConstraints() {
        return constraints;
    }

    public SerializableDatatype(String id, String prefix, String position, String headerLevel,
        String title, Datatype datatype, String defPreText, String defPostText, String usageNote,
        List<SerializableConstraint> constraints, Map<Component, Datatype> componentDatatypeMap,
        Map<Component, List<ValueSetOrSingleCodeBinding>> componentValueSetBindingsMap, List<Table> tables,
        Map<Component, String> componentTextMap, Boolean showConfLength, Boolean showInnerLinks, String host) {
        super(id, prefix, position, headerLevel, title);
        this.datatype = datatype;
        this.defPreText = defPreText;
        this.defPostText = defPostText;
        this.usageNote = usageNote;
        this.constraints = constraints;
        this.componentDatatypeMap = componentDatatypeMap;
        this.componentValueSetBindingsMap = componentValueSetBindingsMap;
        this.tables = tables;
        this.componentTextMap = componentTextMap;
        this.showConfLength = showConfLength;
        this.showInnerLinks = showInnerLinks;
        this.host = host;
    }

    @Override public Element serializeElement() throws DatatypeSerializationException {
        Element datatypeElement = new Element("Datatype");
        if (this.datatype != null) {
            try {
            	Element datatypeMetadata = super.createMetadataElement(datatype);
            	if (datatypeMetadata!=null) {
            		datatypeElement.appendChild(datatypeMetadata);
            	}
            	datatypeElement.addAttribute(new Attribute("ID", datatype.getId() + ""));
                datatypeElement.addAttribute(new Attribute("Name", datatype.getName()));
                datatypeElement.addAttribute(new Attribute("Label", datatype.getLabel()));
                datatypeElement
                    .addAttribute(new Attribute("Description", datatype.getDescription()));
                datatypeElement
                    .addAttribute(new Attribute("ShowConfLength", String.valueOf(showConfLength)));
                datatypeElement
                    .addAttribute(new Attribute("PurposeAndUse", datatype.getPurposeAndUse()));
                datatypeElement.addAttribute(new Attribute("Comment", datatype.getComment()));
                datatypeElement.addAttribute(new Attribute("Hl7Version",
                    datatype.getHl7Version() == null ? "" : datatype.getHl7Version()));
                datatypeElement.addAttribute(new Attribute("id", datatype.getId()));
                for (SerializableConstraint constraint : constraints) {
                    datatypeElement.appendChild(constraint.serializeElement());
                }
                if (datatype.getValueSetBindings() != null && !datatype.getValueSetBindings()
                    .isEmpty()) {
                    Element valueSetBindingListElement = super
                        .createValueSetBindingListElement(datatype.getValueSetBindings(),
                            this.tables, datatype.getLabel());
                    if (valueSetBindingListElement != null) {
                        datatypeElement.appendChild(valueSetBindingListElement);
                    }
                }
                if (datatype.getComments() != null && !datatype.getComments().isEmpty()) {
                    Element commentListElement =
                        super.createCommentListElement(datatype.getComments(), datatype.getLabel());
                    if (commentListElement != null) {
                        datatypeElement.appendChild(commentListElement);
                    }
                }
                
                if(datatype.getComponents().isEmpty()){
                	   datatypeElement
                       .addAttribute(new Attribute("primitive","true"));
                }else{
             	   datatypeElement
                   .addAttribute(new Attribute("primitive","false"));
                }
     
              if ( !componentDatatypeMap.isEmpty()) {
                    for (Component component: componentDatatypeMap.keySet()) {
                    	
                        
                        if(componentDatatypeMap.containsKey(component)){
                        	
                        try {
                            Element componentElement = new Element("Component");
                            componentElement
                                .addAttribute(new Attribute("Name", component.getName()));
                            componentElement
                                .addAttribute(new Attribute("Usage", getFullUsage(datatype, component)));
                            boolean isComplex = false;
                            if (component.getDatatype() != null) {
                                Datatype datatype = componentDatatypeMap.get(component);
                                if (datatype != null) {
                                    componentElement.addAttribute(
                                        new Attribute("Datatype", datatype.getLabel()));
                                    if (this.showInnerLinks) {
                                        String link = this.generateInnerLink(datatype, host);
                                        if (!"".equals(link)) {
                                            componentElement
                                                .addAttribute(new Attribute("InnerLink", link));
                                        }
                                    }
                                    if (datatype.getComponents().size() == 0) {
                                        componentElement.addAttribute(new Attribute("MinLength",
                                            "" + component.getMinLength()));
                                        if (component.getMaxLength() != null && !component
                                            .getMaxLength().equals(""))
                                            componentElement.addAttribute(new Attribute("MaxLength",
                                                component.getMaxLength()));
                                        if (component.getConfLength() != null && !component
                                            .getConfLength().equals(""))
                                            componentElement.addAttribute(
                                                new Attribute("ConfLength", component.getConfLength()));
                                    } else {
                                        isComplex = true;
                                        componentElement
                                            .addAttribute(new Attribute("MinLength", ""));
                                        componentElement
                                            .addAttribute(new Attribute("MaxLength", ""));
                                        componentElement
                                            .addAttribute(new Attribute("ConfLength", ""));
                                    }
                                } else {
                                    throw new DatatypeNotFoundException(component.getDatatype().getId(),component.getDatatype().getLabel());
                                }
                            }
                            if (this.componentValueSetBindingsMap.containsKey(component)) {
                                List<ValueSetOrSingleCodeBinding> valueSetBindings = this.componentValueSetBindingsMap.get(component);
                                if (valueSetBindings != null && !valueSetBindings.isEmpty()) {
                                    List<String> bindingIdentifierList = new ArrayList<>();
                                    for (ValueSetOrSingleCodeBinding valueSetOrSingleCodeBinding : valueSetBindings) {
                                        if (valueSetOrSingleCodeBinding != null
                                            && valueSetOrSingleCodeBinding.getTableId() != null && !valueSetOrSingleCodeBinding.getTableId()
                                            .isEmpty()) {
                                            Table table = super.findTable(tables,
                                                valueSetOrSingleCodeBinding.getTableId());
                                            if (table != null) {
                                                String link = this.generateInnerLink(table, host);
                                                if (this.showInnerLinks && !"".equals(link)) {
                                                    String wrappedLink = this.wrapLink(link, table.getBindingIdentifier());
                                                    bindingIdentifierList.add(wrappedLink);
                                                } else {
                                                    bindingIdentifierList
                                                        .add(table.getBindingIdentifier());
                                                }
                                            } else {
                                                throw new TableNotFoundException(valueSetOrSingleCodeBinding.getTableId());
                                            }
                                        }
                                    }
                                    String bindingIdentifier = StringUtils.join(bindingIdentifierList, ",");
                                    if (bindingIdentifier != null && !bindingIdentifier.isEmpty()) {
                                        componentElement.addAttribute(new Attribute("BindingIdentifier", bindingIdentifier));
                                    }
                                }
                            }
                            String comments = super.findComments(component.getPosition(), datatype.getComments());
                            if (comments != null && !comments.isEmpty())
                                componentElement.addAttribute(new Attribute("Comment", comments));
                            componentElement.addAttribute(new Attribute("Position", component.getPosition().toString()));
                            String componentText = componentTextMap.get(component);
                            if (componentText != null && !componentText.isEmpty()) {
                                componentElement
                                    .appendChild(this.createTextElement("Text", componentText));
                            }
                            componentElement
                                .addAttribute(new Attribute("complex", String.valueOf(isComplex)));
                            datatypeElement.appendChild(componentElement);
                        } catch (Exception e){
                            throw new DatatypeComponentSerializationException(e,component.getPosition());
                        }
                     }
                    }
//                    if (datatype.getComponents().size() == 0) {
//                        Element componentElement = new Element("Component");
//                        componentElement.addAttribute(new Attribute("Name", datatype.getName()));
//                        componentElement.addAttribute(new Attribute("Position", "1"));
//                        datatypeElement.appendChild(componentElement);
//                    }

                    if ((datatype != null && (!this.defPreText.isEmpty()) || !this.defPostText
                        .isEmpty())) {
                        if (this.defPreText != null && !this.defPreText.isEmpty()) {
                            datatypeElement
                                .appendChild(this.createTextElement("DefPreText", this.defPreText));
                        }
                        if (this.defPostText != null && !this.defPostText.isEmpty()) {
                            datatypeElement.appendChild(this.createTextElement("DefPostText", this.defPostText));
                        }
                    }
                    if (this.usageNote != null && !this.usageNote.trim().isEmpty()) {
                        datatypeElement
                            .appendChild(this.createTextElement("UsageNote", this.usageNote));
                    }
                }
            } catch (Exception e){
                throw new DatatypeSerializationException(e,datatype.getLabel());
            }
        }
        datatypeElement.addAttribute(new Attribute("prefix", prefix));
        datatypeElement.addAttribute(new Attribute("position", ""));
        Element sectionElement = super.getSectionElement();
        sectionElement.appendChild(datatypeElement);
        return sectionElement;
    }

    private String getFullUsage(Datatype datatype, Component c ) {
        List<Predicate> predicates = super.findPredicate(c.getPosition(), datatype.getPredicates());
        if (predicates == null || predicates.isEmpty()) {
            return c.getUsage().toString();
        } else {
            Predicate predicate = predicates.get(0);
            return c.getUsage().toString() + "(" + predicate.getTrueUsage() + "/" + predicate.getFalseUsage()
                + ")";
        }
    }

    public Datatype getDatatype() {
        return datatype;
    }
}
