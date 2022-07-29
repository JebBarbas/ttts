// @ts-check

const VERSION = 'v1.1.0'

const $ = selector => document.querySelector(selector)

const form = $('form')
const txt = $('textarea')
const btn = $('button')
const select = $('select')
const main = $('#main')
const loader = $('#loader')
const version = $('#version')

const speaker = window.speechSynthesis

/**
 * Handles an error
 * @param {string} error
 */
function handleError(error){
    console.log(error)
}

/**
 * Sets the page to start to load or to end loading
 * @param {boolean} loading 
 */
function setLoading(loading){
    if(loading){
        main && main.classList.add('invisible')
        loader && loader.classList.remove('invisible')
    }
    else{
        main && main.classList.remove('invisible')
        loader && loader.classList.add('invisible')
    }
}

/**
 * Adds the given voices to the select element in the document
 * @param {SpeechSynthesisVoice[]} voices
 */
function addVoicesToSelect(voices){
    voices.forEach((voice, index) => {
        const selected = index === 0 ? 'selected' : ''

        //const allowedLangs = ['es', 'ja']
        //const isAllowed = allowedLangs.includes(voice.lang.split('-')[0])
        const isAllowed = true

        const voiceOpt = `<option value="${index}" ${selected}>${voice.name} ${voice.lang}</option>`
        isAllowed && select && select.insertAdjacentHTML('beforeend', voiceOpt) 
    })
}

/**
 * Says the given text using the given voice
 * @param {string} text 
 * @param {number} voiceIndex
 */
function speak(text, voiceIndex){
    try{
        const voice = speaker.getVoices()[voiceIndex]
        if(!voice) throw new Error('The selected voice dont exists.')

        let tongue = new SpeechSynthesisUtterance(text)
        tongue.voice = voice
    
        if(!speaker.speaking){
            speaker.speak(tongue)

            setDisabledButton(true)
            tongue.addEventListener('end', () => setDisabledButton(false))
        }
    }
    catch(err){
        handleError(err)
    }
}

/**
 * Disables or enables the button
 * @param {boolean} disabled 
 */
function setDisabledButton(disabled){
    if(disabled){
        if(btn) btn.disabled = true
        if(btn) btn.innerText = 'Hablando...'
    }
    else{
        if(btn) btn.disabled = false
        if(btn) btn.innerText = 'Hablar'
    }
}

form && form.addEventListener('submit', e => {
    e.preventDefault()
    
    if(txt && select && txt.value !== ''){
        speak(txt.value, select.value)
    }
})   

speaker && speaker.addEventListener('voiceschanged', () => {    
    try{
        setLoading(true)
        const internalVoices = speaker.getVoices()    
        addVoicesToSelect(internalVoices)
    }
    catch{
        handleError('There is a big error with the speaker, maybe it dont exists.')
    }
    finally{
        setLoading(false)
    }
})

version ? version.innerText = `JebBarbas's Testing Text To Speech: ${VERSION}` : null
