const testForMidi = () => {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({})
            .then(onMidiSuccess, onMidiFailure);
    } else {
        alert("No MIDI support in your browser.");
    }
}
function onMidiSuccess(midiAccess) {
    // when we get a succesful response, run this code
    midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    var inputs = midi.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMidiMessage;
        console.log(input);
    }
}
function onMidiFailure(e) {
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
    return false;
}
function onMidiMessage(event) {
    if(event.data.length > 1) {
        extractMidiCommand(event.data);
    }
    extractMeta(event);
}
function extractMidiCommand(data){
    raw = data[0];
    cmd = data[0] >> 4;
    channel = data[0] & 0xf;
    type = data[0] & 0xf0;
    note = data[1];
    frequency = midiNoteToStandardFrequency(note - 69);
    velocity = data[2];
    console.log('MIDI data', {raw: raw,cmd: cmd, channel: channel, type: type, note: note,frequency: frequency, velocity: velocity});
}
function  extractMeta(event){
    manufacturer = event.manufacturer;
    name = event.name;
    id = event.id;
    console.log({manufacturer: manufacturer, name: name, id: id})
}
function midiNoteToStandardFrequency(note){
    return 440 * Math.pow(2, (note)/12)
}