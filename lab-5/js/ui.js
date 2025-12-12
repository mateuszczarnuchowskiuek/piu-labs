import store from './store.js';
import * as Helpers from './helpers.js';

const UI = {
    board: document.querySelector('#board'),
    cntSquaresEl: document.querySelector('#cntSquares'),
    cntCirclesEl: document.querySelector('#cntCircles'),
    addSquareBtn: document.querySelector('#addSquare'),
    addCircleBtn: document.querySelector('#addCircle'),
    recolorSquaresBtn: document.querySelector('#recolorSquares'),
    recolorCirclesBtn: document.querySelector('#recolorCircles'),
};

function createShapeElement(shape) {
    const el = document.createElement('div');
    const borderColor = Helpers.darkenHsl(shape.color, 20);
    el.className = `shape ${shape.type}`;
    el.style.backgroundColor = shape.color;
    el.style.borderColor = borderColor;

    el.dataset.id = shape.id;

    return el;
}

function updateCounters() {
    UI.cntSquaresEl.textContent = store.squaresCount;
    UI.cntCirclesEl.textContent = store.circlesCount;
}

function handleStoreChange(action, data) {
    switch (action) {
        case 'INIT':
            updateCounters();
            UI.board.innerHTML = '';
            data.forEach((shape) => {
                UI.board.appendChild(createShapeElement(shape));
            });
            break;

        case 'ADD':
            updateCounters();
            UI.board.appendChild(createShapeElement(data));
            break;

        case 'REMOVE':
            updateCounters();
            const elToRemove = UI.board.querySelector(`[data-id="${data}"]`);
            if (elToRemove) {
                elToRemove.remove();
            }
            break;

        case 'RECOLOR':
            const elementsToRecolor = UI.board.querySelectorAll(
                `.shape.${data}`
            );

            elementsToRecolor.forEach((el) => {
                const shapeId = el.dataset.id;
                const newColor = store.getShape(shapeId)?.color;
                if (newColor) {
                    el.style.backgroundColor = newColor;
                    el.style.borderColor = Helpers.darkenHsl(newColor, 20);
                }
            });
            break;
    }
}

function setupEventListeners() {
    UI.addSquareBtn.addEventListener('click', () => store.addShape('square'));
    UI.addCircleBtn.addEventListener('click', () => store.addShape('circle'));

    UI.recolorSquaresBtn.addEventListener('click', () =>
        store.recolor('square')
    );
    UI.recolorCirclesBtn.addEventListener('click', () =>
        store.recolor('circle')
    );

    UI.board.addEventListener('click', (e) => {
        if (e.target.classList.contains('shape')) {
            const shapeId = e.target.dataset.id;

            if (shapeId) {
                store.removeShape(shapeId);
            }
        }
    });
}

export function initUI() {
    setupEventListeners();
    store.subscribe(handleStoreChange);
}
