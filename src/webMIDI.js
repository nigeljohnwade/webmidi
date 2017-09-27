const testForMidi = () => {
    if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({})
            .then(onMidiSuccess, onMidiFailure);
    } else {
        alert("No MIDI support in your browser.");
    }
}
const onMidiSuccess = (midiAccess) => {
    const midi = midiAccess;
    const inputs = midi.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        input.value.onmidimessage = onMidiMessage;
        console.log(extractMeta(input.value));
    }
}
const onMidiFailure = (e) => {
    console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
    return false;
}
const onMidiMessage = (event) => {
    if(event.data.length > 1) {
        extractMidiCommand(event.data);
    }
}
const extractMidiCommand = (data) => {
    const raw = data[0];
    const cmd = data[0] >> 4;
    const channel = data[0] & 0xf;
    const type = data[0] & 0xf0;
    const data1 = data[1];
    const data2 = data[2];
    const frequency = cmd === 8 || cmd === 9 ? midiNoteToStandardFrequency(data1 - 69): null;
    const note = cmd === 8 || cmd === 9 ? midiNoteNumberToNote(data1): null;
    let cmdName = '';
    switch (cmd){
        case 8:
            cmdName = 'noteOff';
            break;
        case 9:
            cmdName = 'noteOn';
            break;
        case 11:
            cmdName = 'controller';
            break;
        case 14:
            cmdName = 'pitchBend';
            break;
        default:
            cmdName = 'unknown';
    }
    const midiCommand = {
        raw: raw,
        cmd: cmd, 
        channel: channel, 
        type: type, 
        data1: data1, 
        data2: data2,
        frequency: frequency,
        note: note,
        cmdName: cmdName,
    };
    console.log('MIDI data', { midiCommand });
}
const  extractMeta = (input) => {
    manufacturer = input.manufacturer;
    name = input.name;
    id = input.id;
    return {manufacturer: manufacturer, name: name, id: id};
}
const midiNoteToStandardFrequency = (note) => {
    return 440 * Math.pow(2, (note)/12);
}
const midiNoteNumberToNote = (noteNumber) =>{
    const note = `${noteArray[noteNumber % 12]}${Math.floor(noteNumber / 12)}`;
    console.log(note, noteNumber);
    
}
const noteArray = ['C', 'C#', 'D', 'D#',	'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];