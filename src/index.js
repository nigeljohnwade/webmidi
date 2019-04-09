import WebMIDI from './webMIDI';

const webMidi = new WebMIDI();

let x = webMidi.testForMidi();

for(let i = 0; i < 128; i++){
    let d = document.createElement('div');
    d.classList.add(`note-${i}`);
    d.classList.add('note');
    document.querySelector('.note-wrapper').appendChild(d);
}

document.body.addEventListener('midiMessage', (event)=>{
    console.log(`${event.detail.cmdName} - note ${event.detail.data1} - velocity ${event.detail.data2}`);
    const noteWrapper = document.querySelector('.note-wrapper');
    const noteDiv = document.querySelector(`.note-${event.detail.data1}`);
    const pitchBendDiv = document.querySelector('.pitch-bend');
    const modWheelDiv = document.querySelector('.mod-wheel');
    switch(event.detail.cmdName){   
        case 'noteOn':
            noteDiv.style.width = `${(100/127) * event.detail.data2}px`;
            break;
        case 'noteOff':
            noteDiv.style.width = `0px`;
            break;
        case 'pitchBend':
            pitchBendDiv.style.transform = `rotate(${(360/127 * event.detail.data2) - 225}deg)`;
            noteWrapper.style.transform = `rotate(${(36/127 * event.detail.data2)}deg)`;
            break;
        case 'controller.ModWheel':
            modWheelDiv.style.transform = `scale(${100/127 * event.detail.data2 * 0.01})`;
            break;
        default:
    }
});


