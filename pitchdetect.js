/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var isPlaying = false;
var sourceNode = null;
var analyser = null;
var theBuffer = null;
var DEBUGCANVAS = 1;
var detectorElem, 
	canvasElem,
	waveCanvas,
	pitchElem,
	noteElem,
	detuneElem,
	detuneAmount;
	
/////////////////////////////////////////////////////////////////////	
var cpt = 0;
var lastNote=null;
var currentNote=null;
var lastPitch=null;
var fullNote=false;
var muteNote = false;
var startCpt=false;
var closePiano=false;

function rightMove(index){
	$('#n1').text($('#n2').text());
	$('#n2').text($('#n3').text());
	$('#n3').text($('#n4').text());
	$('#n4').text($('#n5').text());
	$('#n5').text($('#n6').text());
	$('#n6').text($('#n7').text());
	$('#n7').text($('#n8').text());
	$('#n8').text($('#n9').text());
	$('#n9').text($('#n10').text());
	if(notes.step[index+5]) $('#n10').text(notes.step[index+5]+showAccidental(index+5));
	else $('#n10').text("-");
}
function transitionToNextNote(index){
	rightMove(index);
	/*$('#n1').text($('#n2').text()).animate({left:'-=80',fontSize: '100%'},"fast");
	$('#n2').text($('#n3').text()).animate({left:'-=80',fontSize: '150%'},"fast");
	$('#n3').text($('#n4').text()).animate({left:'-=80',fontSize: '200%'},"fast");
	$('#n4').text($('#n5').text()).animate({left:'-=80',fontSize: '300%'},"fast");
	$('#n5').text($('#n6').text()).animate({left:'-=80',fontSize: '400%'},"fast");
	$('#n6').text($('#n7').text()).animate({left:'-=80',fontSize: '300%'},"fast");
	$('#n7').text($('#n8').text()).animate({left:'-=80',fontSize: '200%'},"fast");
	$('#n8').text($('#n9').text()).animate({left:'-=80',fontSize: '150%'},"fast");
	$('#n9').text($('#n10').text()).animate({left:'-=80',fontSize: '100%'},"fast");
	if(notes.step[index+5])$('#n10').text(notes.step[index+5]+showAccidental(index+5)).animate({left:'-=80',fontSize: '75%'},"fast");
	else $('#n10').text("-");*/
	
	$('#redThing').animate({left:'+='+noteWidth},"fast");
	if(notes.measureIndex[index] != notes.measureIndex[index-1]) $('#redThing').animate({left:'+='+startOfMeasure},"fast");	// if we go to other measure
	
	if(($('#redThing').offset().left+$('#redThing').width()+40) > ($('#viewer').width()+$('#viewer').offset().left)){ 
		$('#redThing').animate({top:'+='+YMeasures},"fast").animate({left:(margin+clef+gamme)+"px"},"fast");     
	}
	$('html, body').animate({
        scrollTop: $("#redThing").offset().top
    }, 2000);
}
function transitionVerification(pitch,note) {
	currentNote=noteStrings[note%12];
	currentNoteFlat = noteStringsFlat[note%12];
	if(notes.step[noteIndex]=="_"){noteIndex++;transitionToNextNote(noteIndex);}
	
	if((currentNote!=lastNote) && startCpt!=true) startCpt=true;
	if(startCpt)cpt++;
	if(cpt > 5) {
		cpt=0; 
		startCpt=false; 
		console.log("currentNote : "+currentNote+" | notes.step[noteIndex] : "+notes.step[noteIndex]+showAccidental(noteIndex)); 
		if(currentNote==(notes.step[noteIndex]+showAccidental(noteIndex)) || currentNoteFlat==(notes.step[noteIndex]+showAccidental(noteIndex))){
			if(notes.step[noteIndex+1])noteIndex++;
			transitionToNextNote(noteIndex);
		}
	}
	
	lastNote=noteStrings[note%12];
}

/////////////////////////////////////////////////////////////////////

window.onload = function() {
	var request = new XMLHttpRequest();
	request.open("GET", "../sounds/whistling3.ogg", true);
	request.responseType = "arraybuffer";
	request.onload = function() {
	  audioContext.decodeAudioData( request.response, function(buffer) { 
	    	theBuffer = buffer;
		} );
	}
	request.send();

	detectorElem = document.getElementById( "detector" );
	canvasElem = document.getElementById( "output" );
	DEBUGCANVAS = document.getElementById( "waveform" );
	if (DEBUGCANVAS) {
		waveCanvas = DEBUGCANVAS.getContext("2d");
		waveCanvas.strokeStyle = "black";
		waveCanvas.lineWidth = 1;
	}
	pitchElem = document.getElementById( "pitch" );
	noteElem = document.getElementById( "note" );
	detuneElem = document.getElementById( "detune" );
	detuneAmount = document.getElementById( "detune_amt" );

	detectorElem.ondragenter = function () { 
		this.classList.add("droptarget"); 
		return false; };
	detectorElem.ondragleave = function () { this.classList.remove("droptarget"); return false; };
	detectorElem.ondrop = function (e) {
  		this.classList.remove("droptarget");
  		e.preventDefault();
		theBuffer = null;

	  	var reader = new FileReader();
	  	reader.onload = function (event) {
	  		audioContext.decodeAudioData( event.target.result, function(buffer) {
	    		theBuffer = buffer;
	  		}, function(){alert("error loading!");} ); 

	  	};
	  	reader.onerror = function (event) {
	  		alert("Error: " + reader.error );
		};
	  	reader.readAsArrayBuffer(e.dataTransfer.files[0]);
	  	return false;
	};

	$('.checkbox-label').click(function(){
		if($(this).attr('status')=="vo") {		//Piano					
			$(this).attr('status','pi');
			$('#messages').show();
			$('#content').show();
			$('#hertzThing').hide();
			drawRedThing();
			drawBottomNotesArray("p");
			noteIndex=0;
		}else{									// Voice
			$(this).attr('status','vo');
			$('#messages').hide();
			$('#hertzThing').show();
			$('#content').hide();
			toggleLiveInput();
			drawRedThing();
			drawBottomNotesArray("r");
			noteIndex=0;
		}
	});

}

function error() {
    alert('Stream generation failed.');
}

function getUserMedia(dictionary, callback) {
    try {
        navigator.getUserMedia = 
        	navigator.getUserMedia ||
        	navigator.webkitGetUserMedia ||
        	navigator.mozGetUserMedia;
        navigator.getUserMedia(dictionary, callback, error);
    } catch (e) {
        alert('getUserMedia threw exception :' + e);
    }
}

function gotStream(stream) {
    // Create an AudioNode from the stream.
    var mediaStreamSource = audioContext.createMediaStreamSource(stream);

    // Connect it to the destination.
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    mediaStreamSource.connect( analyser );
    updatePitch();
}

function toggleLiveInput() {
    if (isPlaying) {
        //stop playing and return
        sourceNode.stop( now );
        sourceNode = null;
        analyser = null;
        isPlaying = false;
		if (!window.cancelAnimationFrame)
			window.cancelAnimationFrame = window.webkitCancelAnimationFrame;
        window.cancelAnimationFrame( rafID );
    }
	//console.log(notes);
    getUserMedia({audio:true}, gotStream);
}

var rafID = null;
var tracks = null;
var buflen = 2048;
var buf = new Uint8Array( buflen );
var MINVAL = 134;  // 128 == zero.  MINVAL is the "minimum detected signal" level.

function findNextPositiveZeroCrossing( start ) {
	var i = Math.ceil( start );
	var last_zero = -1;
	// advance until we're zero or negative
	while (i<buflen && (buf[i] > 128 ) )
		i++;
	if (i>=buflen)
		return -1;

	// advance until we're above MINVAL, keeping track of last zero.
	while (i<buflen && ((t=buf[i]) < MINVAL )) {
		if (t >= 128) {
			if (last_zero == -1)
				last_zero = i;
		} else
			last_zero = -1;
		i++;
	}

	// we may have jumped over MINVAL in one sample.
	if (last_zero == -1)
		last_zero = i;

	if (i==buflen)	// We didn't find any more positive zero crossings
		return -1;

	// The first sample might be a zero.  If so, return it.
	if (last_zero == 0)
		return 0;

	// Otherwise, the zero might be between two values, so we need to scale it.

	var t = ( 128 - buf[last_zero-1] ) / (buf[last_zero] - buf[last_zero-1]);
	return last_zero+t;
}

var noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
var noteStringsFlat = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

function noteFromPitch( frequency ) {
	var noteNum = 12 * (Math.log( frequency / 440 )/Math.log(2) );
	return Math.round( noteNum ) + 69;
}

function frequencyFromNoteNumber( note ) {
	return 440 * Math.pow(2,(note-69)/12);
}

function centsOffFromPitch( frequency, note ) {
	return Math.floor( 1200 * Math.log( frequency / frequencyFromNoteNumber( note ))/Math.log(2) );
}


function autoCorrelate( buf, sampleRate ) {
	var MIN_SAMPLES = 4;	// corresponds to an 11kHz signal
	var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
	var SIZE = 1000;
	var best_offset = -1;
	var best_correlation = 0;
	var rms = 0;
	var foundGoodCorrelation = false;

	if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
		return -1;  // Not enough data

	for (var i=0;i<SIZE;i++) {
		var val = (buf[i] - 128)/128;
		rms += val*val;
	}
	rms = Math.sqrt(rms/SIZE);
	if (rms<0.01)
		return -1;

	var lastCorrelation=1;
	for (var offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
		var correlation = 0;

		for (var i=0; i<SIZE; i++) {
			correlation += Math.abs(((buf[i] - 128)/128)-((buf[i+offset] - 128)/128));
		}
		correlation = 1 - (correlation/SIZE);
		if ((correlation>0.9) && (correlation > lastCorrelation))
			foundGoodCorrelation = true;
		else if (foundGoodCorrelation) {
			// short-circuit - we found a good correlation, then a bad one, so we'd just be seeing copies from here.
			return sampleRate/best_offset;
		}
		lastCorrelation = correlation;
		if (correlation > best_correlation) {
			best_correlation = correlation;
			best_offset = offset;
		}
	}
	if (best_correlation > 0.01) {
		// console.log("f = " + sampleRate/best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")")
		return sampleRate/best_offset;
	}
	return -1;
//	var best_frequency = sampleRate/best_offset;
}

function updatePitch( time ) {
	var cycles = new Array;
	analyser.getByteTimeDomainData( buf );

	// possible other approach to confidence: sort the array, take the median; go through the array and compute the average deviation
	var ac = autoCorrelate( buf, audioContext.sampleRate );


 	if (ac == -1) {
 		detectorElem.className = "vague";
	 	pitchElem.innerText = "--";
		noteElem.innerText = "-";
		detuneElem.className = "";
		detuneAmount.innerText = "--";
 	} else {
	 	detectorElem.className = "confident";
	 	pitch = ac;
	 	pitchElem.innerText = Math.floor( pitch ) ;
	 	var note =  noteFromPitch( pitch );
		//console.log(note);
		noteElem.innerHTML = noteStrings[note%12];
		var detune = centsOffFromPitch( pitch, note );
		if (detune == 0 ) {
			detuneElem.className = "";
			detuneAmount.innerHTML = "--";
		} else {
			if (detune < 0)
				detuneElem.className = "flat";
			else
				detuneElem.className = "sharp";
			detuneAmount.innerHTML = Math.abs( detune );
		}
/////////////////////////////////////////////////////////////////////
		transitionVerification(pitch,note);
/////////////////////////////////////////////////////////////////////
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = window.webkitRequestAnimationFrame;
	rafID = window.requestAnimationFrame( updatePitch );
}
