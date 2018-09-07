export default class webMIDI{
    constructor(){
        this.testForMidi = this.testForMidi.bind(this);
        this.onMidiMessage = this.onMidiMessage.bind(this);

        this.noteArray = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.controllerObject = {
            '1': 'ModWheel',
            '2': 'BreathController',
            '4': 'FootController',
            '7': 'Volume',
            '8': 'Balance',
            '9': 'Pan',
            '11': 'ExpressionController',
            '16': 'GeneralPurpose',
            '17': 'GeneralPurpose',
            '18': 'GeneralPurpose',
            '19': 'GeneralPurpose',
        }
    }
    
    testForMidi(){
        if (navigator.requestMIDIAccess) {
            navigator.requestMIDIAccess({})
                .then((midi) => {
                    return this.onMidiSuccess(midi);
                },() =>{
                    return this.onMidiFailure(midi);
                });
        } else {
            alert("No MIDI support in your browser.");
        }
    }

    onMidiSuccess(midiAccess){
        const midi = midiAccess;
        const inputs = midi.inputs.values();
        this.inputs = {};
        for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
            input.value.onmidimessage = this.onMidiMessage;
            this.inputs[this.extractMidiMeta(input.value).name] = this.extractMidiMeta(input.value);
        }
        console.log(this.inputs);
        return this.inputs;
    }
    
    onMidiFailure(e){
        console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
        return false;
    }
    
    onMidiMessage(event){
        if(event.data.length > 1) {
            const eventData = this.extractMidiCommand(event.data);
            const customEvent = new CustomEvent('midiMessage', { detail: eventData });
            document.body.dispatchEvent(customEvent);
        }else if(event.data[0] > 248){//ignore clock for now
            console.log(this.extractMidiRealtime(event.data));
        }
    }
    
    extractMidiCommand(data){
        const raw = data[0];
        const cmd = data[0] >> 4;
        const channel = data[0] & 0xf;
        const type = data[0] & 0xf0;
        const data1 = data[1];
        const data2 = data[2];
        const frequency = cmd === 8 || cmd === 9 ? this.midiNoteToStandardFrequency(data1 - 69): null;
        const note = cmd === 8 || cmd === 9 ? this.midiNoteNumberToNote(data1): null;
        let cmdName = '';
        switch (cmd){
            case 8:
                cmdName = 'noteOff';
                break;
            case 9:
                cmdName = 'noteOn';
                break;
            case 11:
                cmdName = `controller.${this.controllerObject[data1]}`;
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
        return midiCommand;
    }
    
    extractMidiMeta(input){
        const manufacturer = input.manufacturer;
        const name = input.name;
        const id = input.id;
        return {manufacturer: manufacturer, name: name, id: id};
    }
    
    extractMidiRealtime(data){
        let realtimeMessage = '';
        switch (data[0]){
            case 248:
                realtimeMessage = 'Clock';
                break;
            case 250:
                realtimeMessage = 'Start';
                break;
            case 251:
                realtimeMessage = 'Continue';
                break;
            case 252:
                realtimeMessage = 'Stop';
                break;
            case 254:
                realtimeMessage = 'ActiveSensing';
                break;
            case 255:
                realtimeMessage = 'SystemReset';
                break;
            default:
                realtimeMessage = 'Udefined';
        }
        return realtimeMessage;
    }
    
    midiNoteToStandardFrequency(note){
        return 440 * Math.pow(2, (note)/12);
    }
    
    midiNoteNumberToNote(noteNumber){
        const note = `${this.noteArray[noteNumber % 12]}${Math.floor(noteNumber / 12)}`;
        console.log(note, noteNumber);
        return note;
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
}
