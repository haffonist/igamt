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
package gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.controller;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import gov.nist.healthcare.nht.acmgt.dto.ResponseMessage;
import gov.nist.healthcare.nht.acmgt.dto.domain.Account;
import gov.nist.healthcare.nht.acmgt.repo.AccountRepository;
import gov.nist.healthcare.nht.acmgt.service.UserService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.BindingParametersForDatatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Component;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Constant.SCOPE;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Constant.STATUS;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.repo.UnchangedDataRepository;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DatatypeLink;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.TableLink;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.UnchangedDataType;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.DatatypeService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.ForbiddenOperationException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.TableService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.DateUtils;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.controller.wrappers.ScopeAndNameAndVersionWrapper;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.controller.wrappers.ScopesAndVersionWrapper;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.exception.DataNotFoundException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.exception.DatatypeDeleteException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.exception.DatatypeSaveException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.exception.NotFoundException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.exception.UserAccountNotFoundException;

/**
 * @author Harold Affo (harold.affo@nist.gov) Mar 17, 2015
 */

@RestController
@RequestMapping("/datatypes")
public class DatatypeController extends CommonController {

  Logger log = LoggerFactory.getLogger(DatatypeController.class);

  @Autowired
  private DatatypeService datatypeService;
  
  @Autowired
  private TableService tableService;

  @Autowired
  UserService userService;

  @Autowired
  AccountRepository accountRepository;
  @Autowired
  UnchangedDataRepository unchangedData;

  @RequestMapping(value = "/findByIds", method = RequestMethod.POST, produces = "application/json")
  public List<Datatype> findByIds(@RequestBody Set<String> ids) {
    log.info("Fetching datatypeByIds..." + ids);
    List<Datatype> result = datatypeService.findByIds(ids);
    return result;
  }

  @RequestMapping(value = "/{id}", method = RequestMethod.GET, produces = "application/json")
  public Datatype getDatatypeById(@PathVariable("id") String id) throws DataNotFoundException {
    log.info("Fetching datatypeById..." + id);
    return findById(id);
  }

  @RequestMapping(value = "/findByScopesAndVersion", method = RequestMethod.POST,
      produces = "application/json")
  public List<Datatype> findByScopesAndVersion(@RequestBody ScopesAndVersionWrapper scopesAndVersion) {
    log.info("Fetching the datatype. scope=" + scopesAndVersion.getScopes() + " hl7Version="
        + scopesAndVersion.getHl7Version());
    List<Datatype> datatypes = new ArrayList<Datatype>();
    try {
      User u = userService.getCurrentUser();
      Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
      if (account == null) {
        throw new UserAccountNotFoundException();
      }

      datatypes.addAll(datatypeService.findByScopesAndVersion(scopesAndVersion.getScopes(),
          scopesAndVersion.getHl7Version()));
      if (datatypes.isEmpty()) {
        throw new NotFoundException("Datatype not found for scopesAndVersion=" + scopesAndVersion);
      }
    } catch (Exception e) {
      log.error("", e);
    }
    return datatypes;
  }
  

  @RequestMapping(value = "/findOneStrandard", method = RequestMethod.POST,produces = "application/json")
	public Datatype findByNameAndVersionAndScope(@RequestBody ScopeAndNameAndVersionWrapper unchagedDatatype) {

	    	    Datatype d =null;
	    	    int max=1;
	    	    try {
	    	      User u = userService.getCurrentUser();
	    	      Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
	    	      if (account == null) {
	    	        throw new UserAccountNotFoundException();
	    	      }
	    	  
	    	      d = datatypeService.findByNameAndVersionAndScope(unchagedDatatype.getName(),unchagedDatatype.getHl7Version(),"HL7STANDARD");
	    	      
	      	      if (d==null) {
		    	        throw new NotFoundException("no standard d");
		    	      }
	    	      d.setExt(max+"");

	    	    	  Datatype temp =  datatypeService.findByNameAndVersionsAndScope(unchagedDatatype.getName(),unchagedDatatype.getVersions(),"MASTER");
	    	    	  if(temp!=null){
	    	    		  String tempext=temp.getExt();
	    	    		  try {
	    	    			 int extd=Integer.parseInt(d.getExt());
	    	    		     int ext = Integer.parseInt(tempext);
	    	    		     if(ext>=extd){
	    	    		    	 d.setExt((ext+1+""));
	    	    		     }
	    	    		} catch (NumberFormatException e) {

	    	    		}
	    	    	  }

	    	    } catch (Exception e) {
	    	      log.error("", e);
	    	    }
	    	    return d;
	   }
  
  
  @RequestMapping(value = "/getLastMaster", method = RequestMethod.POST,produces = "application/json")
 	public Datatype getLastMaster(@RequestBody NameAndVersionWrapper wrapper) {
	            List<SCOPE> scopes=new ArrayList<SCOPE>();
	            Datatype d=null;
	            scopes.add(SCOPE.HL7STANDARD);
 	    	    List<Datatype> result=null;
 	    	    try {
 	    	      User u = userService.getCurrentUser();
 	    	      Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
 	    	      if (account == null) {
 	    	        throw new UserAccountNotFoundException();
 	    	      }
 	    	      List<UnchangedDataType> unchanged =unchangedData.findByNameAndVersions(wrapper.getName(), wrapper.getVersion());
 	    	      if(unchanged!= null&& !unchanged.isEmpty()){
 	    	    	  
 	    	    	 UnchangedDataType model=unchanged.get(0);
 	    	    	 d= datatypeService.findByNameAndVersionAndScope(wrapper.getName(), wrapper.getVersion(),"HL7STANDARD");
 	    	    	if(d!=null){
 	    	    		d.setId(null);
 	    	    		d.setHl7versions(model.getVersions());
 	    	    		String ext =this.findLastExtesionForVersions(model.getName(),model.getVersions());
 	    	    		d.setExt(ext);
 	    	    	} 
 	    	      }
 	    	      
 	    	      }
 	    	    catch (Exception e) {
		    	      log.error("", e);
		    	    }
				return d;
 	    	    
 	   	   }
  public String findLastExtesionForVersions(String name,List<String> versions){
	 
	 List<Datatype> datatypes = datatypeService.findAllByNameAndVersionsAndScope(name, versions, "MASTER");
	 int extd=1;
	 if(datatypes!=null&& !datatypes.isEmpty()){
		String max=datatypes.get(0).getExt(); 
		
		try{
			  extd=Integer.parseInt(max);
		}
		catch (NumberFormatException e) {

		}
		for(Datatype d : datatypes){
			try{
				 int temp=Integer.parseInt(d.getExt());
				 if(temp>=extd){
					 extd=temp+1;
				 }
			}
			catch (NumberFormatException e) {

			}
		}
		
	 }
	 return extd+"";
	 
	 }

	  
	  
	  
  
  
  		
  @RequestMapping(value = "/findPublished", method = RequestMethod.POST)
	public List<Datatype> findPublishedMaster(@RequestBody String version) {
	  			List<Datatype> published=new ArrayList<Datatype>();
	    	    try {
	    	      User u = userService.getCurrentUser();
	    	      Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
	    	      if (account == null) {
	    	        throw new UserAccountNotFoundException();
	    	      }
	    	      List<Datatype> master = datatypeService.findByScope("MASTER");
	    	      for(Datatype dt : master){
	    	    	  if(dt.getStatus().equals(STATUS.PUBLISHED)){
	    	    		  for(String v : dt.getHl7versions()){
	    	    			  if(v.equals(version)){
	    	    				  published.add(dt);
	    	    				  
	    	    			  }
	    	    		  }
	    	    		  
	    	    		  
	    	    	  }
	    	      }
	    	      
	    	    }catch (Exception e) {
		    	      log.error("", e);
		    	    }
	    	    return published;
	   }
    
	    
  @RequestMapping(value = "/save", method = RequestMethod.POST)
  public Datatype save(@RequestBody Datatype datatype) throws DatatypeSaveException,
      ForbiddenOperationException {
    if (!SCOPE.HL7STANDARD.equals(datatype.getScope())) {
      log.debug("datatypeLibrary=" + datatype);
      log.debug("datatypeLibrary.getId()=" + datatype.getId());
      log.info("Saving the " + datatype.getScope() + " datatype.");
      datatype.setDate(DateUtils.getCurrentTime());
      Datatype saved = datatypeService.save(datatype);
      log.debug("saved.getId()=" + saved.getId());
      log.debug("saved.getScope()=" + saved.getScope());
      return saved;
    } else {
      throw new ForbiddenOperationException("FORBIDDEN_SAVE_DATATYPE");
    }
  }

  @RequestMapping(value = "/updateTableBinding", method = RequestMethod.POST)
  public void updateTableBinding(@RequestBody List<BindingParametersForDatatype> bindingParametersList) throws DatatypeSaveException, ForbiddenOperationException, DataNotFoundException {
	  for(BindingParametersForDatatype paras : bindingParametersList){
		  Datatype datatype = this.datatypeService.findById(paras.getDatatypeId());
		  if (!SCOPE.HL7STANDARD.equals(datatype.getScope())) {
			  datatype.setDate(DateUtils.getCurrentTime());
			  Component targetComponent = datatype.getComponents().get(this.indexOfComponent(paras.getComponentId(), datatype));
			  TableLink tableLink = paras.getTableLink();
			  if(tableLink != null && tableLink.getBindingIdentifier() != null && !tableLink.getBindingIdentifier().equals("")) {
				  tableLink.setBindingIdentifier(tableService.findById(tableLink.getId()).getBindingIdentifier());
				  targetComponent.getTables().add(paras.getTableLink());
			  }
			  if(paras.getKey() != null){
				  this.deleteTable(targetComponent, paras.getKey());  
			  }
			  datatypeService.save(datatype);
		  } else {
			  throw new ForbiddenOperationException("FORBIDDEN_SAVE_SEGMENT");  
		  }
	  }
  }

  private void deleteTable(Component targetComponent, String key) throws DataNotFoundException {
	  TableLink found = null;
	  for(TableLink tl:targetComponent.getTables()){
		  if(tl.getId().equals(key)) found = tl;
	  }
	  if(found != null){
		  targetComponent.getTables().remove(found);
	  }else {
		  throw new DataNotFoundException("tableLinkNotFound");
	  }
	
}
  @RequestMapping(value = "/updateDatatypeBinding", method = RequestMethod.POST)
  public void updateDatatypeBinding(@RequestBody List<BindingParametersForDatatype> bindingParametersList) throws DatatypeSaveException, ForbiddenOperationException, DataNotFoundException {
	  for(BindingParametersForDatatype paras : bindingParametersList){
		  Datatype datatype = this.datatypeService.findById(paras.getDatatypeId());
		  if (!SCOPE.HL7STANDARD.equals(datatype.getScope())) {
			  datatype.setDate(DateUtils.getCurrentTime());
			  Component targetComponent = datatype.getComponents().get(this.indexOfComponent(paras.getComponentId(), datatype));
			  TableLink tableLink = paras.getTableLink();
			  DatatypeLink datatypeLink=paras.getDatatypeLink();
			  
			  if(datatypeLink != null) {
				  targetComponent.setDatatype(datatypeLink);
			  }
			  
			  datatypeService.save(datatype);
		  } else {
			  throw new ForbiddenOperationException("FORBIDDEN_SAVE_SEGMENT");  
		  }
	  }
  }

  private void deleteDatatype(Component targetComponent, String key) throws DataNotFoundException {
	  DatatypeLink found = null;
	  if(targetComponent.getDatatype().getId().equals(key)) found = targetComponent.getDatatype();
	  
	  if(found != null){
		  targetComponent.setDatatype(null);;
	  }else {
		  throw new DataNotFoundException("datatypeLinkNotFound");
	  }
	
}

  @RequestMapping(value = "/saveDts", method = RequestMethod.POST)
  public List<Datatype> save(@RequestBody List<Datatype> datatypes) throws DatatypeSaveException,
      ForbiddenOperationException {
	  List<Datatype> dts=new ArrayList<Datatype>();
	  for(Datatype datatype:datatypes){
		  if (!SCOPE.HL7STANDARD.equals(datatype.getScope())) {
		      log.debug("datatype=" + datatype);
		      log.debug("datatype.getId()=" + datatype.getId());
		      log.info("Saving the " + datatype.getScope() + " datatype.");
		      datatype.setDate(DateUtils.getCurrentTime());
		      Datatype saved = datatypeService.save(datatype);
		      log.debug("saved.getId()=" + saved.getId());
		      log.debug("saved.getScope()=" + saved.getScope());
		      dts.add(datatype);
		    } else {
		      throw new ForbiddenOperationException("FORBIDDEN_SAVE_DATATYPE");
		    }
	  }
	  return dts;
    

  }

@RequestMapping(value = "/saveAll", method = RequestMethod.POST)
  public void saveAll(@RequestBody List<Datatype> datatypes) throws DatatypeSaveException {
    log.info("Saving " + datatypes.size() + " datatypes.");
    Iterator<Datatype> it = datatypes.iterator();
    while (it.hasNext()) {
      Datatype c = it.next();
      if (SCOPE.HL7STANDARD.equals(c.getScope())) {
        it.remove();
      }
    }
    datatypeService.save(datatypes);
  }

  @RequestMapping(value = "/{id}/delete", method = RequestMethod.GET)
  public ResponseMessage delete(@PathVariable("id") String id) throws DatatypeDeleteException,
      ForbiddenOperationException, DataNotFoundException {
    Datatype datatype = findById(id);
    if (!SCOPE.HL7STANDARD.equals(datatype.getScope())) {
      log.info("Deleting " + id);
      datatypeService.delete(datatype);
      return new ResponseMessage(ResponseMessage.Type.success, "datatypeDeletedSuccess", null);
    } else {
      throw new ForbiddenOperationException("FORBIDDEN_DELETE_DATATYPE");
    }
  }

  @RequestMapping(value = "/{id}/datatypes", method = RequestMethod.GET,
      produces = "application/json")
  public Set<Datatype> collectDatatypes(@PathVariable("id") String id) throws DataNotFoundException {
    Datatype datatype = findById(id);
    Set<Datatype> datatypes = new HashSet<Datatype>();
    if (datatype != null) {
      List<Component> components = datatype.getComponents();
      for (Component c : components) {
        Datatype dt = datatypeService.findById(c.getDatatype().getId());
        datatypes.addAll(datatypeService.collectDatatypes(dt));
      }
    }
    return datatypes;
  }

  public Datatype findById(String id) throws DataNotFoundException {
    Datatype result = datatypeService.findById(id);
    if (result == null)
      throw new DataNotFoundException("datatypeNotFound");
    return result;
  }

  private int indexOfComponent(String id, Datatype d) throws DataNotFoundException {
	  int index = 0;
	  for(Component c:d.getComponents()){
		  if(id.equals(c.getId())) return index;
		  index = index + 1;
	  }
	  throw new DataNotFoundException("fieldNotFound");
  }
}
