// source: http://stackoverflow.com/a/901144
var bugout = new debugout();
var sheet;
var i = 0;

var notes = {};
notes.step = [];
notes.octave = [];
notes.posX = [];
notes.posY = [];
notes.measureWidth = [];
notes.measureIndex = [];
notes.measureLength = [];
notes.accidental = [];

var measureIndex=0;
var noteIndex=0;
var fifths = "";
var tempF="";

var page_height=1;
var page_width=1;
var doc = null;


var margin = 8;				// Trial and error, really.... 
var clef = 25;
var gamme = 20;
var noteWidth =20;
var endOfMeasure = 20;
var startOfMeasure = 15;
var YfirstMeasure =40;
var YMeasures =82;


$(document).ready(function() {

	var req = new XMLHttpRequest();
	var uri = getParameter('doc');

	drawPage(req,uri);

	$('#opt').change(function() {
		uri = $('#opt option:selected').val();
		drawPage(req,uri);
	});

	$('#id').click(function() {
		$('#yourinputname').trigger('click');
	});

	$('#startle').click(function() {
		$(this).hide();
		$('#wrappeurre').show();
		$('.checkbox-label').trigger( "click" );
	});
});

function drawBottomNotesArray(param){
	$('#beauTom').show();
	if(param=="r")$('#hertzThing').show();
	else $('#messages').show();
	$('#n5').text(notes.step[0]+showAccidental(0));
	$('#n6').text(notes.step[1]+showAccidental(1));
	$('#n7').text(notes.step[2]+showAccidental(2));
	$('#n8').text(notes.step[3]+showAccidental(3));
	$('#n9').text(notes.step[4]+showAccidental(4));
	$('#n10').text(notes.step[5]+showAccidental(5));
}

function showAccidental(index){
	switch (notes.accidental[index]) {
    case "undefined":
        return "";
        break;
    case "flat":
        day = "b";
        break;
    case "natural":
        return "n";
        break;
    case "sharp":
        return "#";
        break;
    default:
		return "";
        break;
	}
}

function drawRedThing(){
	$( "#viewer" ).append( "<div id=\"redThing\"></div>" );
	//console.log(notes.measureWidth[9]+" : "+notes.posX[17]);
	var posX = parseInt(notes.measureWidth[0])+parseInt(notes.measureWidth[9])-75+(parseInt(notes.posX[17]/1.2));
	console.log(posX);
	$("#redThing").css({
		"background-color":"red",
		"opacity":"0.5",
		"display":"block",
		"width": noteWidth+"px",
		"height":"50px",
		"z-index":"3",
		"position":"absolute",
		"left": (margin+clef+gamme)+"px",
		"top": (YfirstMeasure)+"px"
	});
}


function getParameter(name) {
	name = name.replace(/\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
	var results = regex.exec(window.location.search);
	if (results == null) return undefined;
	else return decodeURIComponent(results[1].replace(/\+/g, " "));
}

function drawPage(req,uri) {
	if (! uri) uri = $('#opt option:selected').val();
	req.open('GET', uri, true);
	req.onreadystatechange = function() {
		if (req.readyState != 4) return;
		doc = new Vex.Flow.Document(req.responseText);
		doc.getFormatter().setWidth(800).draw($("#viewer")[0]);
	};
	req.send(null);
	$('.dynamic_lbl').css('display','none');				// Efface les labels dynamiques
	parseShit();
	showCredits();
	gamme = 20;
	getNotes();
	$('#beauTom').hide();
	$('#hertzThing').hide();
	$('#messages').hide();
}

function parseShit() {
	$.ajax({
		type: "GET",
		url: $('#opt option:selected').val(),
		datatype: "xml",
		async: false,
		success: function(xml) {
			sheet = $.xml2json(xml); 
		}
	});
}

function showCredits() {
	page_height = sheet.defaults.page_layout.page_height;
	page_width = sheet.defaults.page_layout.page_width;
	if(sheet.credit){
		$.each(sheet.credit, function(index, element) {			// We dont know how many labels there is : vary from sheet to sheet.
			i++;							// Used to generate dynamic id's
			var label = $("<label class='dynamic_lbl'>");		// To erase labels when switching music
			label.prop("id","lbl_"+i)				// Add an ID 
			if(element.credit_words){
				label.append(element.credit_words.text);		// We fill the label with the content of the "credit_words" (usually the title and such)
				$('body').append(label);				// Insert the label in the page
				label.css({						
					bottom: ($( window ).height()/page_height)*element.credit_words.default_y, 
					left: ($( window ).width()/page_width)*element.credit_words.default_x, 
					zindex:-1,
					position:'absolute'});
				label.css('font-size',element.credit_words.font_size);	// Change the font size (specified in the musicXML document)
			}
		});
	}
}

function getKeySignatureAccidental(fifths , note){	// return the accidental modified by the Key Signature
	var arrNoteKeySharps = ["F", "C", "G", "D", "A", "E", "B"];
	var arrNoteKeyFlats = ["B", "E", "A", "D", "G", "C", "F"];
	if(fifths > 0){
		for ( var i = 0; i < fifths; i++ ) {
			if(note == arrNoteKeySharps[i]) return "sharp";
		}
	}
	else if(fifths < 0){
		for ( var i = 0; i < -fifths; i++ ) {
			if(note == arrNoteKeyFlats[i]) return "flat";
		}
	}
	else if(fifths == 0) gamme=0;
}

function getNotes(){
	notes.step = [];
	notes.octave = [];
	notes.posX = [];
	notes.posY = [];
	notes.measureWidth = [];
	notes.measureIndex = [];
	notes.measureLength = [];
	notes.accidental = [];
	
	$.each(sheet.part.measure, function(index, element) {	
		console.log(element.note);
		if(element.note){
			for ( var i = 0; i < element.note.length; i++ ) {
				if(element.attributes && (fifths == "" || tempF !="")){	// If we change the partition, we want to change the Key Signature as well
					if(element.attributes.key){						// Sometime, there is no key in the attributes
						fifths = element.attributes.key.fifths;		// fifths = really, the Key Signature
						tempF = fifths;								// To account when we switch partitions
					}
				}
				if(element.note[i].pitch){ 							// If it's a note that exist
					notes.step.push(element.note[i].pitch.step);
					notes.octave.push(element.note[i].pitch.octave);
					notes.posX.push(element.note[i].default_x);
					notes.posY.push(element.note[i].default_y);
					notes.measureWidth.push(element.width);
					notes.measureIndex.push(element.number);
					notes.measureLength.push(element.note.length);
					var test = getKeySignatureAccidental(fifths , element.note[i].pitch.step);
					if(test == "flat" || test == "sharp"){
						console.log("KEY SIGNATURE!!! : "+getKeySignatureAccidental(fifths , element.note[i].pitch.step));
						notes.accidental.push(getKeySignatureAccidental(fifths  , element.note[i].pitch.step));
					}
					else 
						notes.accidental.push(element.note[i].accidental);
				}
				else{												// If it's a silence
					notes.step.push("_");
					notes.octave.push("_");
					notes.posX.push("_");
					notes.posY.push("_");
					notes.measureWidth.push(element.width);
					notes.measureIndex.push(element.number);
					notes.measureLength.push(element.note.length);
					notes.accidental.push("_");
				}
			}
		}
	});
	console.log(notes);
}



