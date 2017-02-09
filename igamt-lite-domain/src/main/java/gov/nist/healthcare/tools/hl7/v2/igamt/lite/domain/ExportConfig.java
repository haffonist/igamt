/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified. Abdelghani EL OUAKILI (NIST) Feb 2, 2017
 */
package gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;

/**
 * @author Abdelghani EL Ouakili (NIST)
 *
 */
@Document(collection = "exportConfig")
public class ExportConfig {
  private static final long serialVersionUID = 734059059225906039L;

  @Id
  private String id;
  boolean defaultType = false;
  private String name;
  private Long accountId;
  private String type;

  private UsageConfig segmentORGroupsExport;
  private UsageConfig segmentsExport;
  private UsageConfig fieldsExport;

  private UsageConfig valueSetsExport;
  private CodeUsageConfig codesExport;

  private UsageConfig datatypesExport;
  private UsageConfig componentExport;

  private ColumnsConfig messageColumn;
  private ColumnsConfig segmentColumn;
  public ColumnsConfig datatypeColumn;
  public ColumnsConfig valueSetColumn;


  public ExportConfig() {
    super();
    // TODO Auto-generated constructor stub
  }

  public boolean isDefaultType() {
    return defaultType;
  }

  public void setDefaultType(boolean defaultType) {
    this.defaultType = defaultType;
  }

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Long getAccountId() {
    return accountId;
  }

  public void setAccountId(Long accountId) {
    this.accountId = accountId;
  }

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public UsageConfig getSegmentORGroupsExport() {
    return segmentORGroupsExport;
  }

  public void setSegmentORGroupsExport(UsageConfig segmentORGroupsExport) {
    this.segmentORGroupsExport = segmentORGroupsExport;
  }

  public UsageConfig getSegmentsExport() {
    return segmentsExport;
  }

  public void setSegmentsExport(UsageConfig segmentsExport) {
    this.segmentsExport = segmentsExport;
  }

  public UsageConfig getFieldsExport() {
    return fieldsExport;
  }

  public void setFieldsExport(UsageConfig fieldsExport) {
    this.fieldsExport = fieldsExport;
  }

  public UsageConfig getValueSetsExport() {
    return valueSetsExport;
  }

  public void setValueSetsExport(UsageConfig valueSetsExport) {
    this.valueSetsExport = valueSetsExport;
  }

  public CodeUsageConfig getCodesExport() {
    return codesExport;
  }

  public void setCodesExport(CodeUsageConfig codesExport) {
    this.codesExport = codesExport;
  }

  public UsageConfig getDatatypesExport() {
    return datatypesExport;
  }

  public void setDatatypesExport(UsageConfig datatypesExport) {
    this.datatypesExport = datatypesExport;
  }

  public UsageConfig getComponentExport() {
    return componentExport;
  }

  public void setComponentExport(UsageConfig componentExport) {
    this.componentExport = componentExport;
  }

  public ColumnsConfig getMessageColumn() {
    return messageColumn;
  }

  public void setMessageColumn(ColumnsConfig messageColumn) {
    this.messageColumn = messageColumn;
  }

  public ColumnsConfig getSegmentColumn() {
    return segmentColumn;
  }

  public void setSegmentColumn(ColumnsConfig segmentColumn) {
    this.segmentColumn = segmentColumn;
  }

  public ColumnsConfig getDatatypeColumn() {
    return datatypeColumn;
  }

  public void setDatatypeColumn(ColumnsConfig datatypeColumn) {
    this.datatypeColumn = datatypeColumn;
  }

  public ColumnsConfig getValueSetColumn() {
    return valueSetColumn;
  }

  public void setValueSetColumn(ColumnsConfig valueSetColumn) {
    this.valueSetColumn = valueSetColumn;
  }

  public static long getSerialversionuid() {
    return serialVersionUID;
  }

  public static ExportConfig getBasicExportConfig(){
    ExportConfig defaultConfiguration = new ExportConfig();
    defaultConfiguration.setDefaultType(true);
    defaultConfiguration.setAccountId(null);
    // Default Usages
    UsageConfig displayAll = new UsageConfig();
    UsageConfig displaySelectives = new UsageConfig();
    displaySelectives.setC(true);
    displaySelectives.setX(false);
    displaySelectives.setO(false);
    displaySelectives.setR(true);
    displaySelectives.setRe(true);
    CodeUsageConfig codeUsageExport = new CodeUsageConfig();
    codeUsageExport.setE(false);
    codeUsageExport.setP(true);
    codeUsageExport.setR(true);

    displayAll.setC(true);
    displayAll.setRe(true);
    displayAll.setX(true);
    displayAll.setO(true);
    displayAll.setR(true);

    defaultConfiguration.setSegmentORGroupsExport(displayAll);

    defaultConfiguration.setComponentExport(displayAll);

    defaultConfiguration.setFieldsExport(displayAll);

    defaultConfiguration.setCodesExport(codeUsageExport);

    defaultConfiguration.setDatatypesExport(displaySelectives);
    defaultConfiguration.setSegmentsExport(displaySelectives);
    defaultConfiguration.setValueSetsExport(displaySelectives);

    // Default column
    ArrayList<NameAndPositionAndPresence> generalDefaultList =
        new ArrayList<NameAndPositionAndPresence>();

    generalDefaultList.add(new NameAndPositionAndPresence("Name", 1, true));
    generalDefaultList.add(new NameAndPositionAndPresence("Usage", 2, true));
    generalDefaultList.add(new NameAndPositionAndPresence("Cardinality", 3, true));
    generalDefaultList.add(new NameAndPositionAndPresence("Length", 4, false));
    generalDefaultList.add(new NameAndPositionAndPresence("Confromance Length", 5, false));
    generalDefaultList.add(new NameAndPositionAndPresence("Data Type", 6, true));
    generalDefaultList.add(new NameAndPositionAndPresence("Value Set", 1, true));
    generalDefaultList.add(new NameAndPositionAndPresence("Definition Text", 1, true));
    generalDefaultList.add(new NameAndPositionAndPresence("Comment", 1, true));

    defaultConfiguration.setDatatypeColumn(new ColumnsConfig(generalDefaultList));
    defaultConfiguration.setSegmentColumn(new ColumnsConfig(generalDefaultList));
    defaultConfiguration.setMessageColumn(new ColumnsConfig(generalDefaultList));

    ArrayList<NameAndPositionAndPresence> valueSetsDefaultList =
        new ArrayList<NameAndPositionAndPresence>();

    valueSetsDefaultList.add(new NameAndPositionAndPresence("Value", 1, true));
    valueSetsDefaultList.add(new NameAndPositionAndPresence("Decription", 2, true));
    valueSetsDefaultList.add(new NameAndPositionAndPresence("Code System", 3, true));
    valueSetsDefaultList.add(new NameAndPositionAndPresence("Usage", 4, false));
    valueSetsDefaultList.add(new NameAndPositionAndPresence("Comments", 5, false));

    defaultConfiguration.setValueSetColumn(new ColumnsConfig(valueSetsDefaultList));
    return defaultConfiguration;
  }

}
