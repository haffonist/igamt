package gov.nist.healthcare.tools.hl7.v2.igamt.lite.domain.delta;

import java.util.List;

public class DeltaNode {
	private Delta name;
	private Delta usage;
	private Delta cardmin;
	private Delta cardMax;
	private Delta minLength;
	private Delta maxLength;
	private Delta confLength;
	private Delta datatypeLabel;
	private List<Delta> valueSetOrSingleCode;
	private List<Delta> definitionText;
	private Delta predicate;
	
	
	public Delta getUsage() {
		return usage;
	}
	public void setUsage(Delta usage) {
		this.usage = usage;
	}
	public Delta getCardmin() {
		return cardmin;
	}
	public void setCardmin(Delta cardmin) {
		this.cardmin = cardmin;
	}
	public Delta getCardMax() {
		return cardMax;
	}
	public void setCardMax(Delta cardMax) {
		this.cardMax = cardMax;
	}
	public Delta getMinLength() {
		return minLength;
	}
	public void setMinLength(Delta minLength) {
		this.minLength = minLength;
	}
	public Delta getMaxLength() {
		return maxLength;
	}
	public void setMaxLength(Delta maxLength) {
		this.maxLength = maxLength;
	}
	public Delta getConfLength() {
		return confLength;
	}
	public void setConfLength(Delta confLength) {
		this.confLength = confLength;
	}
	public List<Delta> getValueSetOrSingleCode() {
		return valueSetOrSingleCode;
	}
	public void setValueSetOrSingleCode(List<Delta> valueSetOrSingleCode) {
		this.valueSetOrSingleCode = valueSetOrSingleCode;
	}
	public List<Delta> getDefinitionText() {
		return definitionText;
	}
	public void setDefinitionText(List<Delta> definitionText) {
		this.definitionText = definitionText;
	}
	public Delta getName() {
		return name;
	}
	public void setName(Delta name) {
		this.name = name;
	}
	public Delta getDatatypeLabel() {
		return datatypeLabel;
	}
	public void setDatatypeLabel(Delta datatypeLabel) {
		this.datatypeLabel = datatypeLabel;
	}
	public Delta getPredicate() {
		return predicate;
	}
	public void setPredicate(Delta predicate) {
		this.predicate = predicate;
	}


}
