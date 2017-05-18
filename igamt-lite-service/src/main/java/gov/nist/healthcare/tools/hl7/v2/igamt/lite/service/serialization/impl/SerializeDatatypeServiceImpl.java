package gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.serialization.impl;

import gov.cdc.vocab.service.bean.ValueSet;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.*;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.constraints.ConformanceStatement;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.serialization.SerializableConstraint;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.serialization.SerializableDatatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.serialization.SerializableDateTimeDatatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.DatatypeService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.TableService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.serialization.SerializeConstraintService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.serialization.SerializeDatatypeService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.util.ExportUtil;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.util.SerializationUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
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
 * Created by Maxence Lefort on 12/12/16.
 */
@Service public class SerializeDatatypeServiceImpl implements SerializeDatatypeService {

    @Autowired DatatypeService datatypeService;

    @Autowired TableService tableService;

    @Autowired SerializationUtil serializationUtil;

    @Autowired SerializeConstraintService serializeConstraintService;

    private static final String REQUIRED = "Required";
    private static final String OPTIONAL = "Optional";

    @Override
    public SerializableDatatype serializeDatatype(DatatypeLink datatypeLink, String prefix,
        Integer position, UsageConfig datatypeUsageConfig) {
        if(datatypeLink!=null && datatypeLink.getId()!=null) {
            Datatype datatype = datatypeService.findById(datatypeLink.getId());
            String headerLevel = String.valueOf(3);
            return serializeDatatype(datatype,headerLevel,prefix,position,datatypeUsageConfig);
        }
        return null;
    }

    @Override
    public SerializableDatatype serializeDatatype(DatatypeLink datatypeLink, String prefix,
        Integer position, UsageConfig datatypeUsageConfig,
        Map<String, Datatype> componentProfileDatatypes) {
        if(datatypeLink!=null && datatypeLink.getId()!=null) {
            Datatype datatype = componentProfileDatatypes.get(datatypeLink.getId());
            String headerLevel = String.valueOf(3);
            return serializeDatatype(datatype,headerLevel,prefix,position,datatypeUsageConfig);
        }
        return null;
    }

    private SerializableDatatype serializeDatatype(Datatype datatype, String headerLevel, String prefix, Integer position, UsageConfig datatypeUsageConfig){
        if (datatype !=null && datatype.getId() !=null) {
            String id = datatype.getId();
            String title = datatype.getLabel() + " - " + datatype.getDescription();
            List<ConformanceStatement> generatedConformanceStatements = datatype.retrieveAllConformanceStatements();
            datatype.setConformanceStatements(generatedConformanceStatements);
            List<SerializableConstraint> constraintsList =
                serializeConstraintService.serializeConstraints(datatype, datatype.getName());
            String defPreText, defPostText, usageNote;
            defPreText = defPostText = usageNote = "";
            if (datatype.getDefPreText() != null && !datatype.getDefPreText().isEmpty()) {
                defPreText = serializationUtil.cleanRichtext(datatype.getDefPreText());
            }
            if (datatype.getDefPostText() != null && !datatype.getDefPostText().isEmpty()) {
                defPostText = serializationUtil.cleanRichtext(datatype.getDefPostText());
            }
            if (datatype.getUsageNote() != null && !datatype.getUsageNote().isEmpty()) {
                usageNote = serializationUtil.cleanRichtext(datatype.getDefPreText());
            }
            Map<Component, Datatype> componentDatatypeMap = new HashMap<>();
            Map<Component, List<ValueSetOrSingleCodeBinding>> componentValueSetBindingsMap = new HashMap<>();
            List<Table> tables = new ArrayList<>();
            Map<Component, String> componentTextMap = new HashMap<>();
            ArrayList<Component> toBeRemovedComponents = new ArrayList<>();
            for(ValueSetOrSingleCodeBinding valueSetOrSingleCodeBinding : datatype.getValueSetBindings()){
                if(valueSetOrSingleCodeBinding.getTableId()!=null && !valueSetOrSingleCodeBinding.getTableId().isEmpty()){
                    Table table = tableService.findById(valueSetOrSingleCodeBinding.getTableId());
                    if(table!=null){
                        tables.add(table);
                    }
                }
            }
            if (hasComponentsToBeExported(datatype, datatypeUsageConfig)) {
                for (Component component : datatype.getComponents()) {
                    if (ExportUtil.diplayUsage(component.getUsage(), datatypeUsageConfig)) {
                        if (component.getDatatype() != null && !component.getDatatype().getId()
                            .isEmpty()) {
                            Datatype componentDatatype =
                                datatypeService.findById(component.getDatatype().getId());
                            componentDatatypeMap.put(component, componentDatatype);
                            List<ValueSetOrSingleCodeBinding> componentValueSetBindings = new ArrayList<>();
                            for(ValueSetOrSingleCodeBinding valueSetOrSingleCodeBinding : datatype.getValueSetBindings()){
                                if(valueSetOrSingleCodeBinding.getLocation().equals(String.valueOf(component.getPosition()))){
                                    componentValueSetBindings.add(valueSetOrSingleCodeBinding);
                                }
                            }
                            componentValueSetBindingsMap.put(component,componentValueSetBindings);
                        }

                        if (component.getText() != null && !component.getText().isEmpty()) {
                            String text = serializationUtil.cleanRichtext(component.getText());
                            componentTextMap.put(component, text);
                        }
                    } else {
                        toBeRemovedComponents.add(component);
                    }
                }
                for (Component component : toBeRemovedComponents) {
                    datatype.getComponents().remove(component);
                }
            }
            Boolean showConfLength = serializationUtil.isShowConfLength(datatype.getHl7Version());
            SerializableDatatype serializedDatatype = null;
            if (datatype.getName().equals("DTM")) {
                Map<String, String> dateValues =
                    getDtmDateValues(datatype.getPrecisionOfDTM(), datatype.isTimeZoneOfDTM());
                serializedDatatype =
                    new SerializableDateTimeDatatype(id, prefix, String.valueOf(position),
                        headerLevel, title, datatype, defPreText, defPostText, usageNote,
                        constraintsList, componentDatatypeMap, componentValueSetBindingsMap, tables, componentTextMap,
                        showConfLength, dateValues);
            } else {
                serializedDatatype =
                    new SerializableDatatype(id, prefix, String.valueOf(position), headerLevel,
                        title, datatype, defPreText, defPostText, usageNote, constraintsList,
                        componentDatatypeMap, componentValueSetBindingsMap, tables, componentTextMap, showConfLength);
            }
            return serializedDatatype;
        }
        return null;
    }

    private boolean hasComponentsToBeExported(Datatype datatype, UsageConfig datatypeUsageConfig) {
        //If the datatype has at least 1 component
        if (datatype.getComponents().size() > 0) {
            if (datatypeUsageConfig != null) {
                for (Component component : datatype.getComponents()) {
                    if (ExportUtil.diplayUsage(component.getUsage(), datatypeUsageConfig)) {
                        //that means there is at least 1 component to be exported
                        return true;
                    }
                }
            } else {
                //if no config, then all the components must be exported
                return true;
            }
        }
        return false;
    }

    private Map<String, String> getDtmDateValues(int precisionOfDTM, boolean timeZoneOfDTM) {
        HashMap<String, String> dateValue = new HashMap<>();
        dateValue.put("YYYY", precisionOfDTM >= 1 ? this.REQUIRED : this.OPTIONAL);
        dateValue.put("MM", precisionOfDTM >= 2 ? this.REQUIRED : this.OPTIONAL);
        dateValue.put("DD", precisionOfDTM >= 3 ? this.REQUIRED : this.OPTIONAL);
        dateValue.put("hh", precisionOfDTM >= 4 ? this.REQUIRED : this.OPTIONAL);
        dateValue.put("mm", precisionOfDTM >= 5 ? this.REQUIRED : this.OPTIONAL);
        dateValue.put("ss", precisionOfDTM >= 6 ? this.REQUIRED : this.OPTIONAL);
        dateValue.put("ssss", precisionOfDTM >= 7 ? this.REQUIRED : this.OPTIONAL);
        dateValue.put("timeZone", timeZoneOfDTM ? this.REQUIRED : this.OPTIONAL);
        return dateValue;
    }

	@Override
	public SerializableDatatype serializeDatatype(Datatype datatype) {
		return serializeDatatype(datatype,String.valueOf(1), "1", 1, ExportConfig.getBasicExportConfig("table").getDatatypesExport());
	}
}
