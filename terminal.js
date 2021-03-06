/*! terminal.js v2.0 | (c) 2014 Erik Österberg | https://github.com/eosterberg/terminaljs */

var Terminal = (function () {
    // PROMPT_TYPE
    var PROMPT_INPUT = 1, PROMPT_PASSWORD = 2, PROMPT_CONFIRM = 3

    var fireCursorInterval = function (inputField, terminalObj) {
        var cursor = terminalObj._cursor
        setTimeout(function () {
            if (inputField.parentElement && terminalObj._shouldBlinkCursor) {
                cursor.style.visibility = cursor.style.visibility === 'visible' ? 'hidden' : 'visible'
                fireCursorInterval(inputField, terminalObj)
            } else {
                cursor.style.visibility = 'visible'
            }
        }, 500)
    }

    var firstPrompt = true;
    var defaultPromptChar = '$ ';
    promptInput = function (terminalObj, message, PROMPT_TYPE, callback) {
        var shouldDisplayInput = (PROMPT_TYPE === PROMPT_INPUT)
        var inputField = document.createElement('input')

        inputField.style.position = 'absolute'
        inputField.style.zIndex = '-100'
        inputField.style.outline = 'none'
        inputField.style.border = 'none'
        inputField.style.opacity = '0'
        inputField.style.fontSize = '0.2em'

        terminalObj._inputLine.textContent = ''
        terminalObj._prompt.style.whiteSpace = 'pre'
        terminalObj.setPrompt(defaultPromptChar)
        terminalObj._input.style.display = 'block'
        terminalObj.html.appendChild(inputField)
        fireCursorInterval(inputField, terminalObj)

        var cleanInput = function (input) {
            return input
            return input.slice(promptChar.length + 1, input.length)
        }

        if (message.length) terminalObj.print(PROMPT_TYPE === PROMPT_CONFIRM ? message + ' (y/n)' : message)

        inputField.onblur = function () {
            terminalObj._cursor.style.display = 'none'
        }

        inputField.onfocus = function () {
            inputField.value = terminalObj._inputLine.textContent
            terminalObj._cursor.style.display = 'inline'
        }

        terminalObj.html.onclick = function () {
            inputField.focus()
        }

        inputField.onkeydown = function (e) {
            if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
                e.preventDefault()
            } else if (shouldDisplayInput && e.which !== 13) {
                setTimeout(function () {
                    terminalObj._inputLine.textContent = inputField.value
                }, 1)
            }
        }
        inputField.onkeyup = function (e) {
            if (PROMPT_TYPE === PROMPT_CONFIRM || e.which === 13) {
                terminalObj._input.style.display = 'none'
                var inputValue = inputField.value
                if (shouldDisplayInput) terminalObj.print(defaultPromptChar + inputValue)
                terminalObj.html.removeChild(inputField)
                inputValue = cleanInput(inputValue)
                if (typeof(callback) === 'function') {
                    if (PROMPT_TYPE === PROMPT_CONFIRM) {
                        callback(inputValue.toUpperCase()[0] === 'Y' ? true : false)
                    } else callback(inputValue, e)
                }
            }
        }
        if (firstPrompt) {
            firstPrompt = false
            setTimeout(function () { inputField.focus() }, 50)
        } else {
            inputField.focus()
        }
    }

    var terminalBeep

    var TerminalConstructor = function (className, id) {
        if (!terminalBeep) {
            terminalBeep = document.createElement('audio')
            // TODO: fix the beep
            var source = '<source src="/static/beep.'
            terminalBeep.innerHTML = source + 'mp3" type="audio/mpeg">' + source + 'ogg" type="audio/ogg">'
            terminalBeep.volume = 0.05
        }

        this.html = document.createElement('div')
        this.html.className = 'Terminal'
        if (typeof(className) == 'string') {
            this.html.className += ' ' + className
        }
        if (typeof(id) === 'string') { this.html.id = id }

        this._innerWindow = document.createElement('div')
        this._output = document.createElement('p')
        this._prompt = document.createElement('span')
        this._inputLine = document.createElement('span') //the span element where the users input is put
        this._cursor = document.createElement('span')
        this._input = document.createElement('p') //the full element administering the user input, including cursor

        this._shouldBlinkCursor = true

        this.beep = function () {
            terminalBeep.load()
            terminalBeep.play()
        }

        this.print = function (message) {
            var newLine = document.createElement('div')
            newLine.textContent = message
            this._output.appendChild(newLine)
        }

        this.printHTML = function (message) {
            var newLine = document.createElement('div')
            newLine.innerHTML = message
            this._output.appendChild(newLine)
        }

        this.input = function (message, callback) {
            promptInput(this, message, PROMPT_INPUT, callback)
        }

        this.password = function (message, callback) {
            promptInput(this, message, PROMPT_PASSWORD, callback)
        }

        this.confirm = function (message, callback) {
            promptInput(this, message, PROMPT_CONFIRM, callback)
        }

        this.clear = function () {
            this._output.innerHTML = ''
        }

        this.sleep = function (milliseconds, callback) {
            setTimeout(callback, milliseconds)
        }

        this.setTextSize = function (size) {
            this._output.style.fontSize = size
            this._input.style.fontSize = size
        }

        this.setTextColor = function (col) {
            this.html.style.color = col
            this._cursor.style.background = col
        }

        this.setBackgroundColor = function (col) {
            this.html.style.background = col
        }

        this.setWidth = function (width) {
            this.html.style.width = width
        }

        this.setHeight = function (height) {
            this.html.style.height = height
        }

        this.blinkingCursor = function (bool) {
            bool = bool.toString().toUpperCase()
            this._shouldBlinkCursor = (bool === 'TRUE' || bool === '1' || bool === 'YES')
        }

        this.setPrompt = function (promptChar) {
            this._prompt.textContent = promptChar
        }

        this._input.appendChild(this._prompt)
        this._input.appendChild(this._inputLine)
        this._input.appendChild(this._cursor)
        this._innerWindow.appendChild(this._output)
        this._innerWindow.appendChild(this._input)
        this.html.appendChild(this._innerWindow)

        this.setBackgroundColor('black')
        this.setTextColor('white')
        this.setTextSize('1em')
        this.setWidth('100%')
        this.setHeight('100%')

        this.html.style.fontFamily = 'Monaco, Courier'
        this.html.style.margin = '0'
        this._innerWindow.style.padding = '10px'
        this._input.style.margin = '0'
        this._output.style.margin = '0'
        this._cursor.style.background = 'white'
        this._cursor.innerHTML = 'C' //put something in the cursor..
        this._cursor.style.display = 'none' //then hide it
        this._input.style.display = 'none'
    }

    return TerminalConstructor
}())
