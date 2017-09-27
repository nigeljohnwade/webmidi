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
            cmdName = `controller.${controllerObject[data1]}`;
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
const controllerObject = {
    '1' : 'ModWheel',
    '2' : 'BreathController',
    '4' : 'FootController',
    '7' : 'Volume',
    '8' : 'Balance',
    '9' : 'Pan',
    '11' : 'ExpressionController'
    
}
// Name	Hex	Dec	Comments
// Controller numbers 00 - 1f [0 - 31 decimal] are continuous, LSB (least significant byte)
// Mod Wheel	01	1
// Breath Controller	02	2
// Foot Controller	04	4
// Portamento Time	05	5
// Data Entry MSB	06	6
// Volume	07	7
// Balance	08	8
// Pan	0A	10
// Expression Controller	0B	11
// General Purpose 1	10	16
// General Purpose 2	11	17
// General Purpose 3	12	18
// General Purpose 4	13	19
// 20 - 3f [32 - 63 decimal] are MSB (most significant byte) for 00 - 1f [0 - 31 decimal]
// Sustain	40	64	Momentary Switches
// Portamento	41	65
// Sustenuto	42	66
// Soft Pedal	43	67
// Hold 2	45	69
// General Purpose 5	50	80
// Temp Change (General Purpose 6)	51	81
// General Purpose 6	51	81
// General Purpose 7	52	82
// General Purpose 8	53	83
// Ext Effects Depth	5B	91
// Tremelo Depth	5C	92
// Chorus Depth	5D	93
// Detune Depth (Celeste Depth)	5E	94
// Phaser Depth	5F	95
// Data Increment (Data Entry +1)	60	96
// Data Decrement (Data Entry -1)	61	97
// Non-Registered Param LSB	62	98
// Non-Registered Param MSB	63	99
// Registered Param LSB	64	100
// Registered Param MSB	65	101
// Channel mode message values
// Reset All Controllers	79	121	Val ??
//     Local Control	7A	122	Val 0 = off, 7F (127) = on
// All Notes Off	7B	123	Val must be 0
// Omni Mode Off	7C	124	Val must be 0
// Omni Mode On	7D	125	Val must be 0
// Mono Mode On	7E	126	Val = # of channels, or 0 if # channels equals # voices in receiver
// Poly Mode On	7F	127	Val must be 0