/**********************************************************

Written by:   github.com/moelipp
Version:      2020.2
Date:         March 2020

aiExportJPEGs.jsx

DESCRIPTION

This script selects a folder in illustrator, opens the .ai
files in that folder one by one, and saves artboards 2 - 5
out as JPEGs.  The naming convention for the JPEGs is the
first 11 digits of the filename, followed by a letter
depending on whether the filepath contains the word
'apparel' or not.

For hardgoods:  Artboard 1 = 0 (ignored)
                Artboard 2 = A
                Artboard 3 = B
                Artboard 4 = C
                Artboard 5 = D

For apparel:    Artboard 1 = 0 (ignored)
                Artboard 2 = D
                Artboard 3 = A
                Artboard 4 = C
                Artboard 5 = B

**********************************************************/

"use strict";

var fo = Folder.selectDialog("Choose a folder containing .ai files");
var foOut = Folder.selectDialog("Choose an output folder");
var files;
var n = 0;
var uip;
var result
var errors = [];
var jpegOpts;

function getFiles(fo, aExtensions, bRecursive, aFiles, includeFolder) {

  var exts            = aExtensions ? aExtensions.join("|") : ".+" ;
  var pattern         = new RegExp ( "\\."+exts+"$", "g" );
  var files           = aFiles ? aFiles : [];
  var filterFunction  = function(file) {
                          return pattern.test(file.name);
                        }

  if ( bRecursive ) {
    var foFiles = fo.getFiles();
    while ( f = foFiles.shift() ) {
      if ( f instanceof Folder ) {
        if (includeFolder===true) files[ files.length ] = f; this.getFiles ( f, aExtensions, true, files );
      }
      if ( f instanceof File && pattern.test ( f.name ) && f.name!=".DS_Store" ) {
        files[ files.length ]  = f;
      }
    }
    return files;
  }

  else {
    return fo.getFiles(filterFunction);
  }
}

function exportFile(file, jpegOpts) {
  var doc       = app.open(file);
  var data      = {ok:true};
  var alphabet  = [];
  var testStr   = /.apparel./i;

  // search entire filepath (var fo) for string 'apparel' and assign relevant
  // department to var dept based on result
  testStr.test(fo) ? dept = 'apparel' : dept = 'hardgoods';

  // order of artboards is different for apparel and hardgoods, so change
  // letters assigned to artboards based value of var dept
  if ( dept == 'apparel' ) {
    alphabet   = ["0","D","A","C","B"];
    } else {
      alphabet = ["0","A","B","C","D"];
  }

  try {
    // var i = 1 to omit first artboard.  To include first artboard change var to 0.
    for ( var i = 1; i < doc.artboards.length; i++ ) {
      doc.artboards.setActiveArtboardIndex(i);
      // doc.exportFile( File ( file.parent + "/" + file.name.substr(0,11) + alphabet[i] + ".jpeg" ), ExportType.JPEG, jpegOpts );
      doc.exportFile( File ( foOut + "/" + file.name.substr(0,11) + alphabet[i] + ".jpeg" ), ExportType.JPEG, jpegOpts );
    }
  }

  catch(err) {
    data.ok       = false;
    data.message  = "⚠ " + file.name + " couldn't be exported because: " + err.message;
  }

  doc.close ( SaveOptions.DONOTSAVECHANGES );

  return data;
}

function getjpegOpts() {
  var opts = new ExportOptionsJPEG();
  var scale = 450.0;
  opts.antiAliasing     = true;
  opts.transparency     = false;
  opts.artBoardClipping = true;
  opts.qualitySetting   = 100;
  opts.horizontalScale  = scale;
  opts.verticalScale    = scale;
  return opts;
}

function log(msg) {
  var f = File ( Folder.desktop+"/batchExport.txt" );
  f.open('a');
  f.writeln ( msg );
  f.close();
}

function main() {

  var dept;

  if ( !fo ) return; {
    files = getFiles ( fo, ["ai"], true );
    n = files.length;
  }

  if ( !n )  {
    alert("No .ai files found!");
    return;
  }

  jpegOpts = getjpegOpts();

  uip = app.userInteractionLevel;
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

  while (n--) {
    result = exportFile ( files[n], jpegOpts );
    !result.ok && errors.push ( result.message );
  }

  app.userInteractionLevel = uip;
  errors.length && log ( errors.join("\r") );
  errors.length ? alert( "Errors occured. Check log on desktop." ) : alert( "All JPEGs exported successfully." );
}

main();
