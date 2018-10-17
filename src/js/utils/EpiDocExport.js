import { pd } from 'pretty-data'

/**
 *
 * This function receives a col_id, grabs the first sign
 * and then follows the sign stream to the end of the column.
 * It builds an Epidoc compatible string from the sign stream,
 * and returns that as a promise.
 */
export function parseColumnToEpiDoc(corpus, scroll_version_id, col_id) {
  return new Promise((resolve, reject) => {
    // Set all the header information
    let epidocString = `<?xml version="1.0" encoding="UTF-8"?>
    <?xml-model href="http://www.stoa.org/epidoc/schema/latest/tei-epidoc.rng" schematypens="http://relaxng.org/ns/structure/1.0"?>
    <?xml-model href="http://www.stoa.org/epidoc/schema/latest/tei-epidoc.rng" schematypens="http://purl.oclc.org/dsdl/schematron"?>
    <TEI xmlns="http://www.tei-c.org/ns/1.0" xml:space="preserve" xml:lang="en">
      <teiHeader>
        <fileDesc>
          <titleStmt>
            <title>${corpus.combinations.get(scroll_version_id).name}</title>
          </titleStmt>
          <publicationStmt>
            <authority>
              <!-- Need IAA Metadata for this -->
            </authority>
            <idno type="filename">${corpus.combinations.get(scroll_version_id).name}</idno>
          </publicationStmt>
          <sourceDesc>
            <msDesc>
              <msIdentifier>
                <repository>
                  <!-- Need IAA Metadata for this -->
                </repository>
                <idno>
                  <!-- We don't know this yet, since it may be more than one plate and/or fragment -->
                </idno>
              </msIdentifier>
              <physDesc>
                <objectDesc>
                  <supportDesc>
                    <!-- Similar to information at beginning of DJD entry -->
                    <!-- Do we get this from IAA? -->
                    <support>Scroll of <material>parchment</material>
                      and
                      <objectType /> information,
                      <dimensions />, etc.)
                    </support>
                  </supportDesc>
                  <layoutDesc>
                    <!-- How much to provide here -->
                    <layout>description of text field/campus</layout>
                  </layoutDesc>
                </objectDesc>
                <handDesc>
                  <!-- It might be nice to include the description of the hand here -->
                  <handNote>
                    <!-- Need IAA Metadata for this -->
                  </handNote>
                </handDesc>
              </physDesc>
              <history>
                <origin>
                  <origPlace>
                    <!-- Need IAA Metadata for this -->
                  </origPlace>
                  <origDate>
                    <!-- Need IAA Metadata for this -->
                  </origDate>
                </origin>
                <provenance type="purchased">
                  <!-- Need IAA Metadata for this -->
                </provenance>
    
                <provenance type="observed">
                  <!-- Need IAA Metadata for this -->
                </provenance>
              </history>
            </msDesc>
          </sourceDesc>
        </fileDesc>
      </teiHeader>
      <facsimile>
        <graphic url="photograph of text or monument" />
      </facsimile>
      <text>
        <body>`
    let currentSign_id = corpus.cols.get(col_id, scroll_version_id).col_sign_id
    let done = false
    do {
      // Check for column start
      if (corpus.signs.signIs('COLUMN_START', currentSign_id, scroll_version_id))
        epidocString += `<div type="textpart" subtype="column" n="${
          corpus.cols.get(col_id, scroll_version_id).name
        }"><ab>`

      // Check for line start
      if (corpus.signs.signIs('LINE_START', currentSign_id, scroll_version_id))
        epidocString += `<lb n="${
          corpus.lines.get(corpus.signs.get(currentSign_id).line_id, scroll_version_id).name
        }"/>`

      // We will need to get also word_ids from the API so we can wrap
      // letters in a <w></w> element.

      // Add Character
      // If there is no attribute associated with the letter, then it goes
      // straight into the <lb> element.
      const signTypes = {
        LETTER: 1,
        SPACE: 2,
        POSSIBLE_VACAT: 3,
        VACAT: 4,
        DAMAGE: 5,
        BLANK_LINE: 6,
        PARAGRAPH_MARKER: 7,
        LACUNA: 8,
        BREAK: 9,
        LINE_START: 10,
        LINE_END: 11,
        COLUMN_START: 12,
        COLUMN_END: 13,
        SCROLL_START: 14,
        SCROLL_END: 15,
        NULL: 16,
        TRUE: 17,
        INCOMPLETE_BUT_CLEAR: 18,
        INCOMPLETE_AND_NOT_CLEAR: 19,
        TRUE: 20,
        CONJECTURE: 21,
        SHOULD_BE_ADDED: 22,
        SHOULD_BE_DELETED: 23,
        OVERWRITTEN: 24,
        HORIZONTAL_LINE: 25,
        DIAGONAL_LEFT_LINE: 26,
        DIAGONAL_RIGHT_LINE: 27,
        DOT_BELOW: 28,
        DOT_ABOVE: 29,
        LINE_BELOW: 30,
        LINE_ABOVE: 31,
        BOXED: 32,
        ERASED: 33,
        ABOVE_LINE: 34,
        BELOW_LINE: 35,
        LEFT_MARGIN: 36,
        RIGHT_MARGIN: 37,
        MARGIN: 38,
        UPPER_MARGIN: 39,
        LOWER_MARGIN: 40,
      }
      // Get attributes and add appropriate tags
      // The 'element' key is used in both the opening
      // and closing tag.  The 'attribute' key is used only
      // in the opening tag.  If you want to do a milestone,
      // leave the element value as blank, '', and put the
      // milestone value in the attribute key/value pair, e.g.:
      // {element: '', attribute: 'milestone/'}.
      const sqeToEpiDocAttr = {
        9: { element: 'gap' },
        18: { element: 'damage' },
        19: { element: 'unclear', attribute: 'reason=”illegible”' },
        20: { element: 'supplied', attribute: 'reason="lost"' },
        33: { element: 'del', attribute: 'rend=”erasure”' },
      }

      const attributes = corpus.signs.getSignAttributes(currentSign_id, scroll_version_id)

      for (let i = 0, attr; (attr = attributes[i]); i++) {
        if (sqeToEpiDocAttr[attr]) {
          epidocString += `<${sqeToEpiDocAttr[attr].element}${
            sqeToEpiDocAttr[attr].attribute ? ' ' + sqeToEpiDocAttr[attr].attribute : ''
          }>`
        }
      }

      if (
        corpus.signChars.get(
          corpus.signs.getSignChar(currentSign_id, scroll_version_id),
          scroll_version_id
        ).char === ''
      ) {
        if (attributes.indexOf(2) > -1) epidocString += ' '
      } else {
        epidocString += corpus.signChars.get(
          corpus.signs.getSignChar(currentSign_id, scroll_version_id),
          scroll_version_id
        ).char
      }

      for (let i = attributes.length - 1, attr; (attr = attributes[i]); i--) {
        if (sqeToEpiDocAttr[attr] && sqeToEpiDocAttr[attr].element) {
          epidocString += `</${sqeToEpiDocAttr[attr].element}>`
        }
      }

      // Check for line end
      // if (corpus.signs.signIs('LINE_END', currentSign_id, scroll_version_id)) {
      //   epidocString += '</lb>'
      // }

      // Check for column end, and finish
      if (corpus.signs.signIs('COLUMN_END', currentSign_id, scroll_version_id)) {
        epidocString += '</ab></div>'
        done = true
      }
    } while ((currentSign_id = corpus.signs.getNextSign(currentSign_id)) && !done)

    // Add closing tags
    epidocString += '</body></text></TEI>'
    // Pretty print it
    epidocString = pd.xml(epidocString)

    // Add better check that we have <column></column>,
    // and if not add </column>, or return error for broken string.
    if (epidocString) resolve(epidocString)
    else reject('No stream found')
  })
}
