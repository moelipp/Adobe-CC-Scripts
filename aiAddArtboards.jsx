/**********************************************************

Written by:   github.com/moelipp
Version:      2020.1
Date:         March 2020

aiAddArtboards.jsx

DESCRIPTION

Deletes all artboards except artboard 1, then adds four
artboards in specifed positions.


**********************************************************/

"use strict";

var fo = Folder.selectDialog("Please choose a folder");
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

function deleteArtboards(file, jpegOpts) {
  var doc       = app.open(file);
  var data      = {ok:true};

  // loop to delete all except artboard 1 in document
  try {
    // i = 1 to omit first artboard
    for ( var i = doc.artboards.length; i > 1; i-- ) {
      // remove i-1 as i is count (1 - 5), but we want to remove index no (i.e. 0 - 4)
      doc.artboards.remove(i-1);
    }
  }

  catch(err) {
    data.ok       = false;
    data.message  = "⚠ " + file.name + " couldn't be processed because: " + err.message;
  }


  // set the origin relative to the remaining artboard
  doc.artboards.setActiveArtboardIndex(0);
  CoordinateSystem.ARTBOARDCOORDINATESYSTEM;
  doc.rulerOrigin = [ 0, 0 ];
  doc.pageOrigin  = [ 0, 0 ];

  // add artboards at specified locations
  doc.artboards.add([ 035, 502, 230, 063 ]).name = "View 1";
  doc.artboards.add([ 230, 502, 425, 063 ]).name = "View 2";
  doc.artboards.add([ 428, 502, 623, 063 ]).name = "View 3";
  doc.artboards.add([ 623, 502, 818, 063 ]).name = "View 4";

  // set main artboard as active
  doc.artboards.setActiveArtboardIndex(0);

  doc.close ( SaveOptions.SAVECHANGES );

  return data;
}

function log(msg) {
  var f = File ( Folder.desktop+"/deleteArtboards.txt" );
  f.open('a');
  f.writeln ( msg );
  f.close();
}

function main() {

  if ( !fo ) return; {
    files = getFiles ( fo, ["ai"], true );
    n = files.length;
  }

  if ( !n )  {
    alert("No .ai files found.");
    return;
  }

  uip = app.userInteractionLevel;
  app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

  while (n--) {
    result = deleteArtboards ( files[n] );
    !result.ok && errors.push ( result.message );
  }

  app.userInteractionLevel = uip;
  errors.length && log ( errors.join("\r") );
  errors.length ? alert( "Errors occured. Check log on desktop." ) : alert( "All done!" );
}

main();
