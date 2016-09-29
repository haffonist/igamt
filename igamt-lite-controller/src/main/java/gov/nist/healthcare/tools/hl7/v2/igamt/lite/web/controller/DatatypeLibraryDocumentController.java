package gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.controller;

import java.io.IOException;
import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.*;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.IGDocumentExportService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import gov.nist.healthcare.nht.acmgt.dto.ResponseMessage;
import gov.nist.healthcare.nht.acmgt.dto.domain.Account;
import gov.nist.healthcare.nht.acmgt.repo.AccountRepository;
import gov.nist.healthcare.nht.acmgt.service.UserService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Datatype;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DatatypeLibrary;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DatatypeLibraryDocument;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DatatypeLibraryMetaData;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.DatatypeMatrix;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.TableLibrary;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.UnchangedDataType;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Constant.SCOPE;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.repo.DatatypeMatrixRepository;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.repo.UnchangedDataRepository;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.DatatypeLibraryDocumentService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.DatatypeLibraryService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.DatatypeService;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.exception.LibraryException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.exception.LibraryNotFoundException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.LibrarySaveResponse;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.controller.wrappers.LibraryCreateWrapper;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.controller.wrappers.ScopesAndVersionWrapper;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.exception.LibrarySaveException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.exception.NotFoundException;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.web.exception.UserAccountNotFoundException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@RestController
@RequestMapping("/datatype-library-document")
public class DatatypeLibraryDocumentController {
	Logger log = LoggerFactory.getLogger(DatatypeLibraryController.class);
	@Autowired
	private DatatypeLibraryService datatypeLibraryService;

	@Autowired
	private DatatypeLibraryDocumentService datatypeLibraryDocumentService;
	@Autowired
	private DatatypeMatrixRepository matrix;
	@Autowired
	UserService userService;
	@Autowired
	UnchangedDataRepository unchangedDatatype;
	@Autowired
	AccountRepository accountRepository;
	@Autowired
	IGDocumentExportService igDocumentExportService;
	
	@RequestMapping(method = RequestMethod.GET)
	public List<DatatypeLibraryDocument> getDatatypeLibraries() {
		log.info("Fetching all datatype libraries.");
		List<DatatypeLibraryDocument> datatypeLibrariesDocument = datatypeLibraryDocumentService.findAll();
		return datatypeLibrariesDocument;
	}
	
	@RequestMapping(value = "/{dtLibDocId}/datatypeLibrary", method = RequestMethod.GET, produces = "application/json")
	public DatatypeLibrary getLibraryByDocument(@PathVariable("dtLibDocId") String dtLibId) {
		log.info("Fetching LibrayByDocument..." + dtLibId);
		DatatypeLibrary result = datatypeLibraryDocumentService.getDatatypeLibrary();
		return result;
	}
	
	
	@RequestMapping(value = "/{dtLibDocId}/tableLibrary", method = RequestMethod.GET, produces = "application/json")
	public TableLibrary getTableLibraryByDocument(@PathVariable("dtLibDocId") String dtLibId) {
		log.info("Fetching LibrayByDocument..." + dtLibId);
		TableLibrary result = datatypeLibraryDocumentService.getTableLibrary();
		return result;
	}
	
	
	@RequestMapping(value = "/findByScope", method = RequestMethod.POST, produces = "application/json")
	public List<DatatypeLibraryDocument> findByScope(@RequestBody String scope_) {
		log.info("Fetching datatype libraries...");
		List<DatatypeLibraryDocument> datatypeLibrariesDocument = null;
		try {
			Long accountId = null;
			SCOPE scope = SCOPE.valueOf(scope_);
			User u = userService.getCurrentUser();
			Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
			if (account == null) {
				throw new UserAccountNotFoundException();
			}
			accountId = account.getId();
			datatypeLibrariesDocument = datatypeLibraryDocumentService.findByScope(scope, accountId);
		} catch (Exception e) {
			log.error("", e);
		}
		return datatypeLibrariesDocument;
	}
	
	
	
	@RequestMapping(value = "/findByScopeForAll", method = RequestMethod.POST, produces = "application/json")
	public List<DatatypeLibraryDocument> findByScopeForAll(@RequestBody String scope_) {
		log.info("Fetching datatype libraries...");
		List<DatatypeLibraryDocument> datatypeLibrariesDocument = null;

			SCOPE scope = SCOPE.valueOf(scope_);
			
			datatypeLibrariesDocument = datatypeLibraryDocumentService.findByScope(scope);

		return datatypeLibrariesDocument;
	}
	
	@RequestMapping(value = "/findByScopesAndVersion", method = RequestMethod.POST, produces = "application/json")
	public List<DatatypeLibraryDocument> findByScopesAndVersion(@RequestBody ScopesAndVersionWrapper scopesAndVersion) {
		log.info("Fetching the datatype library document. scope=" + scopesAndVersion.getScopes() + " hl7Version="
				+ scopesAndVersion.getHl7Version());
		List<DatatypeLibraryDocument> datatypes = new ArrayList<DatatypeLibraryDocument>();
		try {
			Long accountId = null;
			User u = userService.getCurrentUser();
			Account account = accountRepository.findByTheAccountsUsername(u.getUsername());
			if (account == null) {
				throw new UserAccountNotFoundException();
			}
			accountId = account.getId();
			// When USER is one of the scopes, we must use the accountId to
			// narrow the results.
			// We then remove the USER scope before running the second query.
			if (scopesAndVersion.getScopes().contains(SCOPE.USER)) {
				datatypes.addAll(datatypeLibraryDocumentService.findByAccountId(accountId, scopesAndVersion.getHl7Version()));
				scopesAndVersion.getScopes().remove(SCOPE.USER);
			}
			datatypes.addAll(datatypeLibraryDocumentService.findByScopesAndVersion(scopesAndVersion.getScopes(),
					scopesAndVersion.getHl7Version()));
			if (datatypes.isEmpty()) {
				throw new NotFoundException("Datatype not found for scopesAndVersion=" + scopesAndVersion);
			}
		} catch (Exception e) {
			log.error("", e);
		}
		return datatypes;
	}
	
	@RequestMapping(value = "/findHl7Versions", method = RequestMethod.GET, produces = "application/json")
	public List<String> findHl7Versions() {
		log.info("Fetching all HL7 versions.");
		List<String> result = datatypeLibraryDocumentService.findHl7Versions();
		return result;
	}
	
	private boolean hasRole(String role) {
		  @SuppressWarnings("unchecked")
		  Collection<GrantedAuthority> authorities = (Collection<GrantedAuthority>)
		  SecurityContextHolder.getContext().getAuthentication().getAuthorities();
		  boolean hasRole = false;
		  for (GrantedAuthority authority : authorities) {
		     hasRole = authority.getAuthority().equals(role);
		     if (hasRole) {
			  break;
		     }
		  }
		  return hasRole;
		}
	@RequestMapping(value = "/create", method = RequestMethod.POST)
	public DatatypeLibraryDocument create(@RequestBody LibraryCreateWrapper dtlcw) throws LibrarySaveException {
		System.out.println(hasRole("ROLE_ADMIN"));
		System.out.println(hasRole("ADMIN"));
		System.out.println(hasRole("admin"));

		SCOPE scope = SCOPE.valueOf(dtlcw.getScope());
		User u = userService.getCurrentUser();
		//String accountType=account.getAccountType();
		//System.out.println(accountType);
		if(scope.equals(scope.USER)){
			return datatypeLibraryDocumentService.create(dtlcw.getName(), dtlcw.getExt(), scope, dtlcw.getHl7Version(),dtlcw.getDescription(),dtlcw.getOrgName(),
					dtlcw.getAccountId());		
			}
		else if(hasRole("admin")&&scope.equals(scope.MASTER)){
			return datatypeLibraryDocumentService.create(dtlcw.getName(), dtlcw.getExt(), scope, dtlcw.getHl7Version(),dtlcw.getDescription(),dtlcw.getOrgName(),
					dtlcw.getAccountId());		
		}
		else{
			throw new LibrarySaveException();
		}

	}
	
	@RequestMapping(value = "/{libId}/saveMetaData", method = RequestMethod.POST)
	public LibrarySaveResponse saveMetaData(@PathVariable("libId") String libId,
			@RequestBody DatatypeLibraryMetaData datatypeLibraryMetaData) throws LibrarySaveException {
		log.info("Saving the " + datatypeLibraryMetaData.getName() + " datatype library.");
		DatatypeLibraryDocument saved = datatypeLibraryDocumentService.saveMetaData(libId, datatypeLibraryMetaData);
		return new LibrarySaveResponse(saved.getMetaData().getDate(), saved.getScope().name());
	}
	
	
	@RequestMapping(value = "/{id}/delete", method = RequestMethod.GET)
	public ResponseMessage delete(@PathVariable String id) {
		datatypeLibraryDocumentService.delete(id);
		return new ResponseMessage(ResponseMessage.Type.success, "datatypeLibraryDocumentDeletedSuccess", null);
	}
	
	@RequestMapping(value = "/save", method = RequestMethod.POST)
	public LibrarySaveResponse save(@RequestBody DatatypeLibraryDocument datatypeLibrary) throws LibrarySaveException {
		log.info("Saving the " + datatypeLibrary.getMetaData().getName() + " datatype library.");
		DatatypeLibraryDocument saved = datatypeLibraryDocumentService.save(datatypeLibrary);
		return new LibrarySaveResponse(saved.getMetaData().getDate(), saved.getScope().name());
	}
	
	@RequestMapping(value = "/getAllDatatypesName", method = RequestMethod.POST)
	public List<UnchangedDataType> getAllDatatypesName() throws LibrarySaveException {
		HashMap<String, Integer> visted= new HashMap<String,Integer>();
		List<UnchangedDataType> result = new ArrayList<UnchangedDataType>();
		
		List <UnchangedDataType> temp=unchangedDatatype.findAll();
		for(UnchangedDataType data: temp){
			if(!data.getName().contains("_")){
				
				result.add(data);
			//	visted.put(data.getName(), 1);
				
			}
		}
		
		
		return result;
	}

	@RequestMapping(value = "/getMatrix", method = RequestMethod.POST)
	public List<DatatypeMatrix> getMatrix() throws LibrarySaveException {
		List<DatatypeMatrix> result = new ArrayList<DatatypeMatrix>();

		List <DatatypeMatrix> temp=matrix.findAll();
		
		for(DatatypeMatrix data: temp){
			if(!data.getName().contains("_")){
				
				result.add(data);				
			}
		}
		
		
		return result;
	}

	private String escapeSpace(String str) {
		return str.replaceAll(" ", "-");
	}

	@RequestMapping(value = "/{libId}/export/html", method = RequestMethod.POST,produces = "text/html")
	public void exportXml(@PathVariable String libId, HttpServletRequest request, HttpServletResponse response) throws IOException {
		log.debug("Exporting the library to HTML");
		DatatypeLibraryDocument lib = datatypeLibraryDocumentService.findById(libId);
		InputStream content = igDocumentExportService.exportAsHtmlDatatypeLibraryDocument(lib);
		response.setContentType("text/html");
		response.setHeader("Content-disposition", "attachment;filename=" + escapeSpace(lib.getMetaData().getName()) + "-" + new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()) + ".html");
		FileCopyUtils.copy(content, response.getOutputStream());
	}

	@RequestMapping(value = "/{libId}/export/docx", method = RequestMethod.POST,produces = "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
	public void exportDocx(@PathVariable String libId, HttpServletRequest request, HttpServletResponse response) throws IOException {
		log.debug("Exporting the library to Word");
		DatatypeLibraryDocument lib = datatypeLibraryDocumentService.findById(libId);
		InputStream content = igDocumentExportService.exportAsDocxDatatypeLibraryDocument(lib);
		response
				.setContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
		response.setHeader("Content-disposition",
				"attachment;filename=" + escapeSpace(lib.getMetaData().getName()) + "-"
						+ new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date()) + ".docx");
		FileCopyUtils.copy(content, response.getOutputStream());
	}

}
