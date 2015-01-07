/*!
 *  copyright 2012 abudaan http://abumarkub.net
 *  code licensed under MIT 
 *  http://abumarkub.net/midibridge/license
 * 
 * 
 *  example of how you can connect MIDI inputs and outputs with MIDIAccess
 * 
 *  The differece with the setup-connections example, is that in this example the output 
 *  gets connected directly in Java via setDirectOutput(); 
 * 
 *  This results in better playback performance. So if your application does a lot
 *  of graphical updates on incoming MIDI events, you should choose this method.
 *  
 *  Compared to the setup-connections example, changes are in the event listeners of the 
 *  MIDI device dropdown menu's.
 *  
 *  In the code starting at line 55, the MIDI events are not passed on to any MIDI output;
 *  the events are only used to perform graphical updated.
 *  
 *  And in the code starting at line 69, the MIDI input is directly connected to the
 *  selected output.
 * 
 *  dependecies:
 *  - MIDIBridge.js
 *  - MIDIDeviceSelector.js
 *  
 */

window.addEventListener('load', function() {

    var midiAccess = null,
    input = null,
    output = null,
    selectInput = document.getElementById("inputs"),
    selectOutput = document.getElementById("outputs");

    
    midiBridge.init(function(_midiAccess){
        
        var inputs,outputs;
        
        midiAccess = _midiAccess;
        inputs = midiAccess.enumerateInputs();
        outputs = midiAccess.enumerateOutputs();
 
        //create dropdown menu for MIDI inputs and add an event listener to the change event
        midiBridge.createMIDIDeviceSelector(selectInput,inputs,"input",function(deviceId){
            if(input){
                input.close();
            }
            
            input = midiAccess.getInput(inputs[deviceId]);
            
            if(input){
                //listen for incoming MIDI messages
                input.addEventListener("midimessage",function(e){
					//if(closePiano=="true")  input.close();
                    if(e.command === midiBridge.NOTE_OFF || e.command === midiBridge.NOTE_ON){
                        $('#messages').text(midiBridge.getNoteName(e.data1,midiBridge.NOTE_NAMES_SHARP));
						currentNote=midiBridge.getNoteName(e.data1,midiBridge.NOTE_NAMES_SHARP);
						currentNoteFlat = midiBridge.getNoteName(e.data1,midiBridge.NOTE_NAMES_FLAT);
						if(notes.step[noteIndex]=="_"){noteIndex++;transitionToNextNote(noteIndex);}
						
						console.log("currentNote : "+currentNote+" | notes.step[noteIndex] : "+notes.step[noteIndex]+showAccidental(noteIndex)); 
						if(currentNote==(notes.step[noteIndex]+showAccidental(noteIndex)) || currentNoteFlat==(notes.step[noteIndex]+showAccidental(noteIndex))){
							if(notes.step[noteIndex+1])noteIndex++;
							transitionToNextNote(noteIndex);
						}
						
						lastNote=midiBridge.getNoteName(e.data1,midiBridge.NOTE_NAMES_SHARP);
					}
                });
            }
        });         
    });

}, false);
