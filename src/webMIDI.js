const testForMidi = () => {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({})
            .then(onMIDISuccess, onMIDIFailure);
    } else {
        alert("No MIDI support in your browser.");
    }
}
function onMIDISuccess(midiAccess) {
    // when we get a succesful response, run this code
    midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status

    var inputs = midi.inputs.values();
    // loop over all available inputs and listen for any MIDI input
    for (var input = inputs.next(); input && !input.done; input = inputs.next()) {
        // each time there is a midi message call the onMIDIMessage function
        input.value.onmidimessage = onMIDIMessage;
    }
}
function onMIDIFailure(e) {
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
    return false;
}
function onMIDIMessage(message) {
    data = message.data; // this gives us our [command/channel, note, velocity] data.
    if (data.length > 1) {
        console.log(message);
        console.log('MIDI data', data); // MIDI data [144, 63, 73]
    }
}