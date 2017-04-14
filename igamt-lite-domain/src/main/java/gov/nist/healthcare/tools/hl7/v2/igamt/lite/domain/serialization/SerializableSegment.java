package gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.serialization;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.*;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.*;
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
public class SerializableSegment extends SerializableSection {

  private Segment segment;
  private String defPreText, defPostText, name, label, description, comment;
  private List<SerializableConstraint> constraints;
  private Map<Field, Datatype> fieldDatatypeMap;
  private Map<Field, List<ValueSetOrSingleCodeBinding>> fieldValueSetBindingsMap;
  private List<Table> tables;
  private Map<String, Table> coConstraintValueTableMap;
  private Boolean showConfLength;


  public SerializableSegment(String id, String prefix, String position, String headerLevel,
      String title, Segment segment, String name, String label, String description, String comment,
      String defPreText, String defPostText, List<SerializableConstraint> constraints,
      Map<Field, Datatype> fieldDatatypeMap,
      Map<Field, List<ValueSetOrSingleCodeBinding>> fieldValueSetBindingsMap, List<Table> tables,
      Map<String, Table> coConstraintValueTableMap, Boolean showConfLength) {
    super(id, prefix, position, headerLevel, title);
    this.segment = segment;
    this.name = name;
    this.label = label;
    this.description = description;
    this.comment = comment;
    this.defPreText = defPreText;
    this.defPostText = defPostText;
    this.constraints = constraints;
    this.fieldDatatypeMap = fieldDatatypeMap;
    this.fieldValueSetBindingsMap = fieldValueSetBindingsMap;
    this.tables = tables;
    this.coConstraintValueTableMap = coConstraintValueTableMap;
    this.showConfLength = showConfLength;
  }



  @Override
  public Element serializeElement() {
    Element segmentElement = new Element("Segment");
    if (segment != null) {
      segmentElement.addAttribute(new Attribute("id", segment.getId()));
      segmentElement.addAttribute(new Attribute("Name", this.name));
      segmentElement.addAttribute(new Attribute("Label", this.label));
      segmentElement.addAttribute(new Attribute("Position", ""));
      segmentElement.addAttribute(new Attribute("Description", this.description));
      segmentElement.addAttribute(new Attribute("ShowConfLength", String.valueOf(showConfLength)));
      if (this.comment != null && !this.comment.isEmpty()) {
        segmentElement.addAttribute(new Attribute("Comment", this.comment));
      }

      if ((segment.getText1() != null && !segment.getText1().isEmpty())
          || (segment.getText2() != null && !segment.getText2().isEmpty())) {
        if (this.defPreText != null && !this.defPreText.isEmpty()) {
          segmentElement.appendChild(this.createTextElement("DefPreText", this.defPreText));
        }
        if (this.defPostText != null && !this.defPostText.isEmpty()) {
          segmentElement.appendChild(this.createTextElement("DefPostText", this.defPostText));
        }
      }

      if (segment.getValueSetBindings() != null && !segment.getValueSetBindings().isEmpty()) {
        Element valueSetBindingListElement = super.createValueSetBindingListElement(
            segment.getValueSetBindings(), this.tables, segment.getLabel());
        if (valueSetBindingListElement != null) {
          segmentElement.appendChild(valueSetBindingListElement);
        }
      }
      if (segment.getComments() != null && !segment.getComments().isEmpty()) {
        Element commentListElement =
            super.createCommentListElement(segment.getComments(), segment.getLabel());
        if (commentListElement != null) {
          segmentElement.appendChild(commentListElement);
        }
      }
      for (int i = 0; i < segment.getFields().size(); i++) {
        Field field = segment.getFields().get(i);
        Element fieldElement = new Element("Field");
        boolean isComplex = false;
        fieldElement.addAttribute(new Attribute("Name", field.getName()));
        fieldElement.addAttribute(new Attribute("Usage", getFullUsage(segment, i).toString()));
        Datatype datatype = fieldDatatypeMap.get(field);
        if (field.getDatatype() != null && datatype != null) {
          fieldElement.addAttribute(new Attribute("Datatype", datatype.getLabel()));
          if (datatype.getComponents().size() > 0) {
            isComplex = true;
            fieldElement.addAttribute(new Attribute("ConfLength", ""));
            fieldElement.addAttribute(new Attribute("MinLength", ""));
            fieldElement.addAttribute(new Attribute("MaxLength", ""));
          } else {
            if (field.getConfLength() != null && !"".equals(field.getConfLength())) {
              fieldElement.addAttribute(new Attribute("ConfLength", field.getConfLength()));
            }
            fieldElement
                .addAttribute(new Attribute("MinLength", String.valueOf(field.getMinLength())));
            if (field.getMaxLength() != null && !field.getMaxLength().equals(""))
              fieldElement.addAttribute(new Attribute("MaxLength", field.getMaxLength()));
          }
        }
        if (this.fieldValueSetBindingsMap.containsKey(field)) {
          List<ValueSetOrSingleCodeBinding> valueSetBindings =
              this.fieldValueSetBindingsMap.get(field);
          if (valueSetBindings != null && !valueSetBindings.isEmpty()) {
            List<String> bindingIdentifierList = new ArrayList<>();
            for (ValueSetOrSingleCodeBinding valueSetOrSingleCodeBinding : valueSetBindings) {
              if (valueSetOrSingleCodeBinding != null
                  && valueSetOrSingleCodeBinding.getTableId() != null
                  && !valueSetOrSingleCodeBinding.getTableId().isEmpty()) {
                Table table = super.findTable(tables, valueSetOrSingleCodeBinding.getTableId());
                bindingIdentifierList.add(table.getBindingIdentifier());
              }
            }
            String bindingIdentifier = StringUtils.join(bindingIdentifierList, ",");
            if (bindingIdentifier != null && !bindingIdentifier.isEmpty()) {
              fieldElement.addAttribute(new Attribute("BindingIdentifier", bindingIdentifier));
            }
          }
        }
        fieldElement.addAttribute(new Attribute("complex", String.valueOf(isComplex)));
        fieldElement.addAttribute(new Attribute("Min", String.valueOf(field.getMin())));
        fieldElement.addAttribute(new Attribute("Max", field.getMax()));
        if (field.getItemNo() != null && !field.getItemNo().equals(""))
          fieldElement.addAttribute(new Attribute("ItemNo", field.getItemNo()));
        String comments = super.findComments(field.getPosition(), segment.getComments());
        if (comments != null && !comments.isEmpty())
          fieldElement.addAttribute(new Attribute("Comment", comments));
        fieldElement.addAttribute(new Attribute("Position", String.valueOf(field.getPosition())));

        if (field.getText() != null && !field.getText().isEmpty()) {
          fieldElement.appendChild(this.createTextElement("Text", field.getText()));
        }
        segmentElement.appendChild(fieldElement);
      }

      if (!constraints.isEmpty()) {
        for (SerializableConstraint constraint : constraints) {
          segmentElement.appendChild(constraint.serializeElement());
        }
      }
      CoConstraintsTable coConstraintsTable = segment.getCoConstraintsTable();
      if(coConstraintsTable.getIfColumnData()!=null && !coConstraintsTable.getIfColumnData().isEmpty()){
        Element coConstraintsElement = new Element("coconstraints");
        Element tableElement = new Element("table");
        tableElement.addAttribute(new Attribute("class", "contentTable"));

        Element thead = new Element("thead");
        thead.addAttribute(new Attribute("class", "contentThead"));
        Element tr = new Element("tr");
        Element th = new Element("th");
        th.addAttribute(new Attribute("class","ifContentThead"));
        th.appendChild("IF");
        tr.appendChild(th);
        th = new Element("th");
        th.addAttribute(new Attribute("colspan",String.valueOf(coConstraintsTable.getThenColumnDefinitionList().size())));
        th.appendChild("THEN");
        tr.appendChild(th);
        th = new Element("th");
        th.addAttribute(new Attribute("colspan",String.valueOf(coConstraintsTable.getUserColumnDefinitionList().size())));
        th.appendChild("USER");
        tr.appendChild(th);
        thead.appendChild(tr);
        tr = new Element("tr");
        th = new Element("th");
        th.addAttribute(new Attribute("class","ifContentThead"));
        th.appendChild(this.segment.getName()+"-"+coConstraintsTable.getIfColumnDefinition().getPath());
        tr.appendChild(th);
        for(CoConstraintColumnDefinition coConstraintColumnDefinition : coConstraintsTable.getThenColumnDefinitionList()){
          Element thThen = new Element("th");
          thThen.appendChild(this.segment.getName()+"-"+coConstraintColumnDefinition.getPath());
          tr.appendChild(thThen);
        }
        for(CoConstraintUserColumnDefinition coConstraintColumnDefinition : coConstraintsTable.getUserColumnDefinitionList()){
          Element thUser = new Element("th");
          thUser.appendChild(coConstraintColumnDefinition.getTitle());
          tr.appendChild(thUser);
        }
        thead.appendChild(tr);
        tableElement.appendChild(thead);
        Element tbody = new Element("tbody");
        for(int i=0;i<coConstraintsTable.getRowSize();i++){
          if(coConstraintsTable.getIfColumnData().get(i).getValueData().getValue()!=null && !coConstraintsTable.getIfColumnData().get(i).getValueData().getValue().isEmpty()){
            boolean thenEmpty = true;
            for(CoConstraintColumnDefinition coConstraintColumnDefinition : coConstraintsTable.getThenColumnDefinitionList()){
              if(!coConstraintsTable.getThenMapData().get(coConstraintColumnDefinition.getId()).get(i).getValueSets().isEmpty() 
                  || !coConstraintsTable.getThenMapData().get(coConstraintColumnDefinition.getId()).get(i).getValueData().getValue().isEmpty()){
                thenEmpty = false;
                break;
              }
            }
            if(!thenEmpty){
              tr = new Element("tr");
              Element td = new Element("td");
              td.appendChild(coConstraintsTable.getIfColumnData().get(i).getValueData().getValue());
              tr.appendChild(td);
              for(CoConstraintColumnDefinition coConstraintColumnDefinition : coConstraintsTable.getThenColumnDefinitionList()){
                CoConstraintTHENColumnData coConstraintTHENColumnData = coConstraintsTable.getThenMapData().get(coConstraintColumnDefinition.getId()).get(i);
                td = new Element("td");
                if(coConstraintTHENColumnData.getValueSets().isEmpty()){
                  if(coConstraintTHENColumnData.getValueData() == null || coConstraintTHENColumnData.getValueData().getValue() == null || coConstraintTHENColumnData.getValueData().getValue().isEmpty()){
                    td.addAttribute(new Attribute("class","greyCell"));
                  } else {
                    td.appendChild(coConstraintTHENColumnData.getValueData().getValue());
                  }
                } else {
                  ArrayList<String> valueSetsList = new ArrayList<>();
                  for(ValueSetData valueSetData : coConstraintTHENColumnData.getValueSets()){
                    Table table = coConstraintValueTableMap.get(valueSetData.getTableId());
                    if(table!=null){
                      valueSetsList.add(table.getBindingIdentifier());
                    }
                  }
                  td.appendChild(StringUtils.join(valueSetsList,","));
                }
                tr.appendChild(td);
              }
              for(CoConstraintUserColumnDefinition coConstraintColumnDefinition : coConstraintsTable.getUserColumnDefinitionList()){
                CoConstraintUSERColumnData coConstraintUSERColumnData = coConstraintsTable.getUserMapData().get(coConstraintColumnDefinition.getId()).get(i);
                td = new Element("td");
                if(!coConstraintUSERColumnData.getText().isEmpty()){
                  td.appendChild(coConstraintUSERColumnData.getText());
                } else {
                  td.addAttribute(new Attribute("class","greyCell"));
                }
                tr.appendChild(td);
              }
              tbody.appendChild(tr);
            }
          }
        }
        tableElement.appendChild(tbody);
        coConstraintsElement.appendChild(tableElement);
        segmentElement.appendChild(coConstraintsElement);
      }
    }

    return segmentElement;
  }

  private String getFullUsage(Segment segment, int i) {
    List<Predicate> predicates = super.findPredicate(i + 1, segment.getPredicates());
    if (predicates == null || predicates.isEmpty()) {
      return segment.getFields().get(i).getUsage().toString();
    } else {
      Predicate p = predicates.get(0);
      return segment.getFields().get(i).getUsage().toString() + "(" + p.getTrueUsage() + "/"
          + p.getFalseUsage() + ")";
    }
  }

  public List<SerializableConstraint> getConstraints() {
    return constraints;
  }

  public Segment getSegment() {
    return segment;
  }
}
