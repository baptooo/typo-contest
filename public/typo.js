const text = [
    "Notre connaissance du monde est immensément plus vaste qu'il y a quelques",
    "siècles, mais nous ne savons guère mieux répondre à la question : pourquoi",
    "y a-t-il quelque chose plutôt que rien ? Il apparaît pourtant une",
    "différence majeure : désormais, la question est posée au physicien, et non",
    "plus au théologien et au philosophe. La réponse éventuelle peut ainsi être",
    "critiquée sur des bases rationnelles, et elle ne demande pas à être",
    "acceptée éternellement par un acte de foi.",
];
let started = false;
let timer = 0;
let words = 0;
const STORAGE_KEY = 'saveScoreBoard';
const scoreElt = document.getElementById('score');
const formElt = document.getElementById('form');
const scoreBoardElt = document.getElementById('score-board');
const resetElt = document.getElementById('reset');

let bindings = [];
const bind = (elem, event, callback) => {
    elem.addEventListener(event, callback);

    bindings.push(() => elem.removeEventListener(event, callback));
    console.log(bindings.length);
}
const unbind = () => bindings = bindings.filter((unbindFn) => {
    try {
        unbindFn();
        return false;
    } catch(err) {
        return true;
    }
})

function onValidWord() {
    const elapsed = Date.now() - timer;
    words++;
    const score = (words / (elapsed / 1000 / 60)).toFixed(2);

    scoreElt.innerHTML = `${score} mpm`;

    return score;
}

function blockKeys(evt) {
    switch (evt.key) {
        case 'Backspace':
            if (evt.ctrlKey === true) {
                evt.preventDefault();
                evt.stopPropagation();
                return false;
            }
            break;
        case 'Tab':
            evt.preventDefault();
            evtp.stopPropagation();
            return false;
    }
}

function renderScoreBoard(scoreBoard = JSON.parse(localStorage[STORAGE_KEY] || '[]')) {
    scoreBoardElt.innerHTML = scoreBoard
        .sort((a, b) => parseFloat(a.score) < parseFloat(b.score) ? 1 : -1)
        .map(
            (result) => `<li>
                <strong>${result.score}</strong> by ${result.name} le
                ${new Date(result.timestamp).toLocaleDateString()}
            </li>`
        ).join('');
}

function gameEnd() {
    started = false;
    const finalScore = onValidWord();
    unbind();

    const scoreBoard = JSON.parse(localStorage[STORAGE_KEY] || '[]');
    const name = prompt(`${finalScore} !!, enter your name`);
    scoreBoard.push({ name, score: finalScore, timestamp: Date.now() });
    localStorage[STORAGE_KEY] = JSON.stringify(scoreBoard);

    renderScoreBoard(scoreBoard);
}

function next(form, current = null) {
    const line = current.dataset.line;
    let valid = true;

    const onInput = (evt) => {
        blockKeys(evt);
        if (started === false) {
            started = true;
            timer = Date.now();
            words = 0;
        }

        const value = evt.target.value;
        const currentValidState = line.indexOf(value) !== -1;

        if (value === line) {
            unbind();
            current.setAttribute('readonly', true);
            try {
                next(form, current.nextElementSibling.nextElementSibling);
            } catch (err) {
                gameEnd();
            }
        }

        if (valid && !currentValidState) {
            current.classList.add('invalid');
        } else if (!valid && currentValidState) {
            current.classList.remove('invalid');
        }
        if (evt.data === ' ' && valid) {
            onValidWord();
        }
        valid = currentValidState;
    }
    current.focus();
    bind(current, 'input', onInput);
    bind(current, 'keydown', blockKeys);
}

function start() {

    const html = text.map((line, idx) => {
        return `<p>${line}</p><input type="text" data-line="${line}" />`;
    }).join('');

    formElt.innerHTML = html;
    started = false;
    scoreElt.innerHTML = '-- mpm';
    unbind();

    next(formElt, formElt.querySelector('input'));
}

window.addEventListener('keydown', (evt) => {
    switch (evt.key) {
        case 'Escape':
            start();
            break;
        default:
            break;
    }
});

resetElt.addEventListener('click', (evt) => {
    scoreBoardElt.innerHTML = '';
    localStorage[STORAGE_KEY] = '[]';
    renderScoreBoard();
})

renderScoreBoard();
start();