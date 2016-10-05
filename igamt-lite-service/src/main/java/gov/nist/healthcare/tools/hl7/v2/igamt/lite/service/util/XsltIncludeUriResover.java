package gov.nist.healthcare.tools.hl7.v2.igamt.lite.service.util;

import javax.xml.transform.Source;
import javax.xml.transform.TransformerException;
import javax.xml.transform.URIResolver;
import javax.xml.transform.stream.StreamSource;
import java.io.InputStream;

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
 * Created by Maxence Lefort on 10/5/16.
 */
public class XsltIncludeUriResover implements URIResolver {

    @Override
    public Source resolve(String href, String base) throws TransformerException {
        try {
            if(!href.startsWith("templates/")){
                href = "templates/".concat(href);
            }
            InputStream inputStream = this.getClass().getClassLoader().getResourceAsStream("rendering/" + href);
            return new StreamSource(inputStream);
        } catch (Exception ex) {
            ex.printStackTrace();
            return null;
        }
    }

}
