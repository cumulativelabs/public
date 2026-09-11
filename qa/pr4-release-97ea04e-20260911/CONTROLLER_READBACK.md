# Controller release hold and evidence qualification

Founder visually accepted the exact preview and requested merge. Independent QA of candidate `97ea04ee7c1e80e5a047c278807b593131dbabd3` returned FAIL for PR4-QA-01. The merge is held; no candidate source changes, main write or production deployment were performed.

The release-blocking evidence accepted by the controller is the **native confirmation** (`native-confirmation.json` and paired PNGs), comparing the exact production baseline and candidate in both engines at DPR 2. The native sampler explicitly scales CSS-coordinate rectangles by two before indexing device-pixel screenshots. It confirms normal-text contrast regression and the mis-sized glyph mask.

**Qualification:** the preliminary eight-state `dpr-contrast-results.json` uses the earlier `contrast-sample.mjs`, which indexes CSS-coordinate rectangles in device-pixel captures without scaling them. Those preliminary numerical results must be treated as diagnostic/invalid for quantitative acceptance, not as eight independently validated contrast failures. The authored QA report is preserved; its eight-state quantitative claim is subject to this qualification. The correctly mapped native comparison independently supports the same FAIL verdict. No candidate code or QA verdict was changed to resolve this evidence issue.

The QA worker was local-output-only. This separate evidence branch is controller persistence, not a merge of the candidate and not a production release. Internal controller-bundle identifiers and a local assembly utility are omitted from the public package; any whitespace normalization is recorded in `PUBLICATION_NORMALIZATION.json`. Complete original worker evidence remains in the controller's private execution archive. All public screenshots are fresh test-browser pages, not personal-device photos.

Next action: a separately authorized, narrow mask-size correction and new exact-state independent QA. Preserve the approved fan, cursor reach/brightness, copy, core/output and mobile design. Do not restart visual exploration or bypass the failed release check.
