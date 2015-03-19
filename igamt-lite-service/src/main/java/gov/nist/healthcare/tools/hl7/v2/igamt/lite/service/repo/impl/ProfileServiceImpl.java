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

/**
 * 
 * @author Olivier MARIE-ROSE
 * 
 */

package gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.repo.impl;

import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.ProfileMetaData;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.ProfileSummary;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.repo.ProfileRepository;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.clone.ProfileClone;
import gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.repo.ProfileService;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileServiceImpl implements ProfileService {

	@Autowired
	private ProfileRepository profileRepository;

	@PersistenceContext
	private EntityManager entityManager;

	private ProfileClone profileClone;

	@Override
	@Transactional
	public Profile save(Profile p) {
		return profileRepository.save(p);
	}

	@Override
	@Transactional
	public void delete(Long id) {
		profileRepository.delete(id);
	}

	@Override
	public Profile findOne(Long id) {
		return profileRepository.findOne(id);
	}

	@Override
	public List<ProfileSummary> findAllPreloadedSummaries() {
		List result = profileRepository.findAllPreloadedSummaries();
		List<ProfileSummary> summaries = new ArrayList<ProfileSummary>();
		for (int i = 0; i < result.size(); i++) {
			Object res = result.get(i);
			ProfileSummary sum = new ProfileSummary();
			Object[] row = (Object[]) res;
			sum.setId(Long.valueOf(row[0].toString()));
			sum.setMetaData((ProfileMetaData) row[1]);
			summaries.add(sum);
		}

		return summaries;

	}

	@Override
	public Iterable<ProfileSummary> findAllSummariesByUser(Long userId) {
		return profileRepository.findAllSummariesByUserId(userId);
	}

	@Override
	public Profile clone(Profile p) {
		return new ProfileClone().clone(p);
	}

	/*
	 * { "component": { "59": { "usage": "C" }, "303": { "maxLength": "27" } } }
	 */
	@Override
	public String[] apply(String changes) {
		return new String[1];
	}

	/*
	 * (non-Javadoc)
	 * 
	 * @see
	 * gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.repo.ProfileService
	 * #detach(gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.Profile)
	 */
	@Override
	public void detach(Profile profile) {
		entityManager.detach(profile);
	}
}