// @ts-check

const VERSION = 'v1.2.1'

const $ = selector => document.querySelector(selector)

const txt = $('textarea')
const btn = $('button')
const voicesSelect = $('#voices')
const filterSelect = $('#filter')
const main = $('#main')
const loader = $('#loader')
const version = $('#version')
const chars = $('#chars')
const modal = $('.modal')
const modalContent = $('.modal-content')

const speaker = (() => {
    try{
        if(typeof speechSynthesis === 'undefined') throw new Error()

        return window.speechSynthesis
    }
    catch{
        handleError('Tu navegador no soporta el Text To Speech')
        return null
    }
})();

let isPendingToEnd = true

/**
 * Handles an error
 * @param {string} error
 */
function handleError(error){
    if(modal && modalContent){
        modalContent.innerText = error
        modal.classList.remove('invisible')
    }
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
 * Deletes the duplicade values of some array
 * @param {unknown[]} array 
 * @returns {unknown[]}
 */
function deleteDuplicates(array){
    try{
        return [...new Set(array)]
    }
    catch{
        handleError('Tu navegador no soporta ciertas caracteristicas, puede que el filtrador no funcione correctamente')
        return [...array]
    }
}

/**
 * Deletes the inner HTML of some element
 * @param {Element | null} element 
 */
function resetInnerHTML(element){
    element ? element.innerHTML = '' : null
}

/**
 * Adds the given voices to the select element in the document
 */
function addVoicesToSelect(){
    try{
        if(!speaker) return

        setLoading(true)

        resetInnerHTML(voicesSelect)

        /** 
         * Language list of the voices
         * @type {string[]} 
         */
        const langs = []
        const voices = speaker.getVoices() 

        voices.forEach((voice, index) => {
            const selected = index === 0 ? 'selected' : ''
            const lang = voice.lang.split('-')[0]

            langs.push(lang)

            const voiceOpt = `<option value="${index}" ${selected}>${voice.name} ${voice.lang}</option>`
            voicesSelect && voicesSelect.insertAdjacentHTML('beforeend', voiceOpt) 
        })

        deleteDuplicates(langs).forEach(lang => {
            const langOpt = `<option value="${lang}">${lang}</option>`
            filterSelect && filterSelect.insertAdjacentHTML('beforeend', langOpt)
        })
    }
    catch{
        handleError('No se pudieron obtener las voces de su dispositivo.')
    }
    finally{
        setLoading(false)
    }
}

/**
 * Event listener of the filter input, filters the values on the voices select
 */
function filterVoicesInSelect(){
    try{
        setLoading(true)

        // Deletes the innerHTML to start again
        resetInnerHTML(voicesSelect)

        /** @type {string} */
        const filter = voicesSelect ? filterSelect.value : 'no'

        const voices = speaker?.getVoices() ?? []
        let isSelected = false

        voices.forEach((voice, index) => {
            const isValidVoice = filter === 'no' ? true : (
                voice.lang.split('-')[0] === filter
            )
            
            if(!isValidVoice) return

            // The first time, it will return 'selected', the next times, nothing
            const selected = isSelected ? '' : 'selected'
            isSelected = true

            const voiceOpt = `<option value="${index}" ${selected}>${voice.name} ${voice.lang}</option>`
            voicesSelect && voicesSelect.insertAdjacentHTML('beforeend', voiceOpt) 
        })
    }
    catch{
        handleError('No se pudieron filtrar las voces')
    }
    finally{
        setLoading(false)
    }
}

/**
 * Says the given text using the given voice
 * @param {string} text 
 * @param {number} voiceIndex
 */
function speak(text, voiceIndex){
    try{
        if(!speaker) return

        const voice = speaker.getVoices()[voiceIndex]
        if(!voice) throw new Error('La voz seleccionada no existe, escoja otra.')

        let tongue = new SpeechSynthesisUtterance(text)
        tongue.voice = voice
    
        if(!speaker.speaking){
            speaker.speak(tongue)

            txt ? txt.disabled = true : null
            voicesSelect ? voicesSelect.disabled = true : null

            tongue.addEventListener('end', () => {
                isPendingToEnd = true

                setDisabledState(false)
                btn ? btn.innerText = 'Hablar' : null
            })
        }

        if(text.length >= 80){
            if(isPendingToEnd){
                speaker.resume()
                isPendingToEnd = false

                btn ? btn.innerText = 'Pausa' : null
            }
            else{
                speaker.pause()
                isPendingToEnd = true

                btn ? btn.innerText = 'Continua' : null
            }
        }
        else{
            setDisabledState(true)
            btn ? btn.innerText = 'Hablando...' : null
        }
    }
    catch(err){
        handleError(err)
    }
}

/**
 * Disables or enables the button, textbox and select
 * @param {boolean} disabled 
 */
function setDisabledState(disabled){
    if(btn && txt && voicesSelect){
        btn.disabled = disabled
        txt.disabled = disabled
        voicesSelect.disabled = disabled
    }
}

btn && btn.addEventListener('click', e => {
    e.preventDefault()
    
    if(txt && voicesSelect && txt.value !== ''){
        speak(txt.value, voicesSelect.value)
    }
})   

txt && txt.addEventListener('input', () => {
    chars ? chars.innerText = `Carácteres: ${txt.value.length}` : null
})

modalContent && modalContent.addEventListener('click', e => {
    e.stopPropagation()
})

modal && modal.addEventListener('click', () => {
    modal.classList.add('invisible')
})

speaker && speaker.addEventListener('voiceschanged', addVoicesToSelect)
addVoicesToSelect()

filterSelect && filterSelect.addEventListener('change', filterVoicesInSelect)

version ? version.innerText = `JebBarbas's Testing Text To Speech: ${VERSION}` : null
