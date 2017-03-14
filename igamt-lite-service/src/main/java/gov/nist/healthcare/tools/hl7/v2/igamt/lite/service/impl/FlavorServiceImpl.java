/**
 * This software was developed at the National Institute of Standards and Technology by employees of
 * the Federal Government in the course of their official duties. Pursuant to title 17 Section 105
 * of the United States Code this software is not subject to copyright protection and is in the
 * public domain. This is an experimental system. NIST assumes no responsibility whatsoever for its
 * use by other parties, and makes no guarantees, expressed or implied, about its quality,
 * reliability, or any other characteristic. We would appreciate acknowledgement if the software is
 * used. This software can be redistributed and/or modified freely provided that any derivative
 * works bear some notice that they are derived from it, and any modified versions bear some notice
 * that they have been modified. Ismail Mellouli (NIST) Mar 14, 2017
 */

package gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.impl;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Component;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Constant.SCOPE;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DataModel;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Field;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.PathGroup;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Segment;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.SegmentRef;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.SubProfileComponentAttributes;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.FlavorService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.QueryService;

@Service

public class FlavorServiceImpl implements FlavorService {

  @Autowired
  QueryService queryService;

  @Override
  public DataModel createFlavor(DataModel dm, List<SubProfileComponentAttributes> attributes,
      List<PathGroup> pathGroups) {
    if (dm instanceof SegmentRef) {
      SegmentRef segRef = (SegmentRef) dm;
      if (attributes != null && !attributes.isEmpty()) {
        for (SubProfileComponentAttributes attr : attributes) {
          if (attr.getComment() != null) {
            segRef.setComment(attr.getComment());
          }
          if (attr.getMax() != null) {
            segRef.setMax(attr.getMax());
          }
          if (attr.getMin() != null) {
            segRef.setMin(attr.getMin());
          }
          if (attr.getUsage() != null) {
            segRef.setUsage(attr.getUsage());
          }
        }
      }
      if (!pathGroups.isEmpty()) {
        Segment originalSeg = queryService.getSegmentsMap().get(segRef.getRef().getId());
        try {
          Segment segmentFlavor = originalSeg.clone(null, null);
          segmentFlavor.setExt("pc" + "_" + segRef.getPosition());
          segmentFlavor.setId(ObjectId.get().toString());
          segmentFlavor.setScope(SCOPE.USER);
          queryService.getSegmentsMap().put(segmentFlavor.getId(), segmentFlavor);
          segRef.getRef().setId(segmentFlavor.getId());
          segRef.getRef().setExt(segmentFlavor.getExt());


        } catch (CloneNotSupportedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      }
      return segRef;



    } else if (dm instanceof Field) {
      Field field = (Field) dm;
      if (attributes != null && !attributes.isEmpty()) {
        for (SubProfileComponentAttributes attr : attributes) {
          if (attr.getComment() != null) {
            field.setComment(attr.getComment());
          }
          if (attr.getMax() != null) {
            field.setMax(attr.getMax());
          }
          if (attr.getMin() != null) {
            field.setMin(attr.getMin());
          }
          if (attr.getUsage() != null) {
            field.setUsage(attr.getUsage());
          }
          if (attr.getConfLength() != null) {
            field.setConfLength(attr.getConfLength());
          }
          if (attr.getMaxLength() != null) {
            field.setMaxLength(attr.getMaxLength());
          }
          if (attr.getMinLength() != null) {
            field.setMinLength(attr.getMinLength());
          }
        }
      }
      if (!pathGroups.isEmpty()) {
        Datatype originalDt = queryService.getDatatypesMap().get(field.getDatatype().getId());
        try {
          Datatype datatypeFlavor = originalDt.clone();
          datatypeFlavor.setExt("pc" + "_" + field.getPosition());
          datatypeFlavor.setId(ObjectId.get().toString());
          datatypeFlavor.setScope(SCOPE.USER);
          queryService.getDatatypesMap().put(datatypeFlavor.getId(), datatypeFlavor);
          field.getDatatype().setId(datatypeFlavor.getId());
          field.getDatatype().setExt(datatypeFlavor.getExt());

        } catch (CloneNotSupportedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      }
      return field;

    } else if (dm instanceof Component) {
      Component component = (Component) dm;
      if (attributes != null && !attributes.isEmpty()) {
        for (SubProfileComponentAttributes attr : attributes) {
          if (attr.getComment() != null) {
            component.setComment(attr.getComment());
          }
          if (attr.getUsage() != null) {
            component.setUsage(attr.getUsage());
          }
          if (attr.getConfLength() != null) {
            component.setConfLength(attr.getConfLength());
          }
          if (attr.getMaxLength() != null) {
            component.setMaxLength(attr.getMaxLength());
          }
          if (attr.getMinLength() != null) {
            component.setMinLength(attr.getMinLength());
          }
        }
      }
      if (!pathGroups.isEmpty()) {
        Datatype originalDt = queryService.getDatatypesMap().get(component.getDatatype().getId());;
        try {
          Datatype datatypeFlavor = originalDt.clone();
          datatypeFlavor.setExt("pc" + "_" + component.getPosition());
          datatypeFlavor.setId(ObjectId.get().toString());
          datatypeFlavor.setScope(SCOPE.USER);
          queryService.getDatatypesMap().put(datatypeFlavor.getId(), datatypeFlavor);
          component.getDatatype().setId(datatypeFlavor.getId());
          component.getDatatype().setExt(datatypeFlavor.getExt());
        } catch (CloneNotSupportedException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
      }
      return component;


    }

    return dm;
  }
}
