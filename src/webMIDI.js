const testForMidi = () => {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({})
            .then(onMidiSuccess, onMidiFailure);
    } else {
        alert("No MIDI support in your browser.");
    }
}
function onMidiSuccess(midiAccess) {
    const midi = midiAccess;
    const inputs = midi.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMidiMessage;
        console.log(extractMeta(input.value));
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
function  extractMeta(input){
    manufacturer = input.manufacturer;
    name = input.name;
    id = input.id;
    return {manufacturer: manufacturer, name: name, id: id};
}
function midiNoteToStandardFrequency(note){
    return 440 * Math.pow(2, (note)/12);
}