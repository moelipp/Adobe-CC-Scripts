/**********************************************************

Written by:   github.com/moelipp
Version:      2020.1
Date:         January 2020

inddAutoPDF.jsx

DESCRIPTION

When run as a startup script in InDesign, listens for files
with a filename containing 'construct' (or whatever you
change var re to - line 38), and automatically produces a
PDF in the same folder location when the file is closed.

**********************************************************/

"use strict";

#target Indesign
#targetengine "openConfirmation"

app.addEventListener("afterOpen", listenForClose);

function listenForClose() {

  #target Indesign
  #targetengine "saveConfirmation"

  app.addEventListener("afterSave", exportPDFInBackground);

  // export PDF before closing only if filename contains the string "construct"
  function exportPDFInBackground() {

    var doc = app.activeDocument;
    // get filename and remove ".indd" extension
    var docName = doc.name.slice(0, -5);
    // set regex to search filename for
    var re = /construct/i;

    // search(re) returns -1 if the filename does not contain var docName
    if ( docName.search(re) !== -1 ) {
      app.interactivePDFExportPreferences.viewPDF = false;
      // export interactive PDF of the open document with current filename, in same location
      doc.exportFile(ExportFormat.interactivePDF, File(doc.filePath + "/" + docName + ".pdf"), false);
    }
  }
};
