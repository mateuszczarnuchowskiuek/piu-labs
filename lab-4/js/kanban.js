document.addEventListener('DOMContentLoaded', () => {
    const boardContainer = document.querySelector('.board-container');

    const lists = {
        'col-todo': document.getElementById('list-todo'),
        'col-progress': document.getElementById('list-progress'),
        'col-done': document.getElementById('list-done'),
    };

    const columnOrder = ['list-todo', 'list-progress', 'list-done'];

    function findParent(element, targetClass) {
        let currentElement = element;
        while (currentElement && currentElement.tagName !== 'BODY') {
            if (currentElement.classList.contains(targetClass)) {
                return currentElement;
            }
            currentElement = currentElement.parentNode;
        }
        return null;
    }

    function getRandomColor() {
        const hue = Math.floor(Math.random() * 360);
        return `hsl(${hue}, 80%, 85%)`;
    }

    function updateCounters() {
        for (const colId in lists) {
            const list = lists[colId];
            const header = list.parentNode.querySelector('.column-header');
            const counter = header.querySelector('.counter');
            counter.textContent = `(${list.children.length})`;
        }
        saveState();
    }

    function sortList(list, isAscending) {
        const cardsArray = [];
        for (const element of list.children) {
            cardsArray.push(element);
        }

        cardsArray.sort((a, b) => {
            const textA = a
                .querySelector('.card-content')
                .innerText.toLowerCase();
            const textB = b
                .querySelector('.card-content')
                .innerText.toLowerCase();

            return isAscending
                ? textA.localeCompare(textB)
                : textB.localeCompare(textA);
        });

        for (const card of cardsArray) {
            list.appendChild(card);
        }
    }

    function autoSortColumn(columnDiv) {
        if (!columnDiv) return;

        const list = columnDiv.querySelector('.card-list');
        const sortBtn = columnDiv.querySelector('.btn-sort');
        const currentSymbol = sortBtn.textContent.trim();

        const isAscending = currentSymbol === 'A↑';

        sortList(list, isAscending);
    }

    function saveState() {
        const data = {};
        for (const colId in lists) {
            const list = lists[colId];

            const columnDiv = list.parentNode;
            const sortBtn = columnDiv.querySelector('.btn-sort');
            const sortDirection = sortBtn.textContent.trim();

            const cards = [];
            for (const card of list.children) {
                cards.push({
                    id: card.dataset.id,
                    content: card.querySelector('.card-content').innerHTML,
                    color: card.style.backgroundColor,
                });
            }

            data[colId] = {
                cards: cards,
                sortDirection: sortDirection,
            };
        }
        localStorage.setItem('kanbanBoardData', JSON.stringify(data));
    }

    function loadState() {
        const dataJson = localStorage.getItem('kanbanBoardData');
        if (!dataJson) return;

        const data = JSON.parse(dataJson);

        for (const colId in data) {
            const list = lists[colId];
            list.innerHTML = '';

            let cardsData = [];
            let sortDir = 'A↓';

            if (Array.isArray(data[colId])) {
                cardsData = data[colId];
            } else {
                cardsData = data[colId].cards;
                sortDir = data[colId].sortDirection;
            }

            const columnDiv = list.parentNode;
            const sortBtn = columnDiv.querySelector('.btn-sort');
            if (sortBtn) {
                sortBtn.textContent = sortDir;
                sortBtn.title =
                    sortDir === 'A↑'
                        ? 'Sortuj odwrotnie (Z-A)'
                        : 'Sortuj alfabetycznie (A-Z)';
            }

            cardsData.forEach((cardData) => {
                const newCard = createCardElement(
                    cardData.content,
                    cardData.color,
                    cardData.id
                );
                list.appendChild(newCard);
            });

            autoSortColumn(columnDiv);
        }
        updateCounters();
    }

    function createCardElement(text = 'Nowe zadanie', color = null, id = null) {
        const div = document.createElement('div');
        div.className = 'card';
        div.dataset.id = id || Date.now().toString();
        div.style.backgroundColor = color || getRandomColor();

        div.innerHTML = `
            <button class="btn-delete" title="Usuń kartę">&times;</button>
            <div class="card-content" contenteditable="true">${text}</div>
            <div class="card-actions">
                <button class="btn-move btn-left" title="Przesuń w lewo">←</button>
                <button class="btn-card-color" title="Zmień kolor karty">🎨</button>
                <button class="btn-move btn-right" title="Przesuń w prawo">→</button>
            </div>
        `;

        return div;
    }

    boardContainer.addEventListener('keydown', (e) => {
        if (e.target.classList.contains('card-content')) {
            if (e.key === 'Enter') {
                if (e.shiftKey) {
                    return;
                } else {
                    e.preventDefault();
                    e.target.blur();
                }
            }
        }
    });

    boardContainer.addEventListener('input', (e) => {
        if (e.target.classList.contains('card-content')) {
            saveState();
        }
    });

    boardContainer.addEventListener('focusout', (e) => {
        if (e.target.classList.contains('card-content')) {
            const card = findParent(e.target, 'card');
            if (card) {
                const columnDiv = findParent(card, 'column');
                autoSortColumn(columnDiv);
                saveState();
            }
        }
    });

    boardContainer.addEventListener('click', (e) => {
        let btn = e.target;

        if (btn.tagName !== 'BUTTON') {
            btn = btn.parentNode;
        }

        if (!btn || btn.tagName !== 'BUTTON') return;

        if (btn.classList.contains('btn-add')) {
            const columnDiv = findParent(btn, 'column');
            const list = columnDiv.querySelector('.card-list');

            const newCard = createCardElement();
            list.appendChild(newCard);

            autoSortColumn(columnDiv);
            updateCounters();
        } else if (btn.classList.contains('btn-color-col')) {
            const columnDiv = findParent(btn, 'column');
            const list = columnDiv.querySelector('.card-list');
            const newColor = getRandomColor();

            for (const card of list.children) {
                card.style.backgroundColor = newColor;
            }
            saveState();
        } else if (btn.classList.contains('btn-sort')) {
            const columnDiv = findParent(btn, 'column');
            const list = columnDiv.querySelector('.card-list');

            const currentSymbol = btn.textContent.trim();
            let isAscending = false;

            if (currentSymbol === 'A↓') {
                isAscending = true;
                btn.textContent = 'A↑';
                btn.title = 'Sortuj odwrotnie (Z-A)';
            } else {
                isAscending = false;
                btn.textContent = 'A↓';
                btn.title = 'Sortuj alfabetycznie (A-Z)';
            }

            sortList(list, isAscending);
            saveState();
        } else if (btn.classList.contains('btn-delete')) {
            const card = findParent(btn, 'card');
            card.remove();
            updateCounters();
        } else if (btn.classList.contains('btn-card-color')) {
            const card = findParent(btn, 'card');
            card.style.backgroundColor = getRandomColor();
            saveState();
        } else if (btn.classList.contains('btn-move')) {
            const card = findParent(btn, 'card');
            const currentList = card.parentNode;
            const currentListId = currentList.id;

            const currentIndex = columnOrder.indexOf(currentListId);
            let nextIndex = currentIndex;

            if (btn.classList.contains('btn-left')) {
                nextIndex = currentIndex - 1;
            } else if (btn.classList.contains('btn-right')) {
                nextIndex = currentIndex + 1;
            }

            if (nextIndex >= 0 && nextIndex < columnOrder.length) {
                const targetListId = columnOrder[nextIndex];
                const targetList = document.getElementById(targetListId);
                targetList.appendChild(card);

                const targetColumn = findParent(targetList, 'column');
                autoSortColumn(targetColumn);

                updateCounters();
            }
        }
    });

    loadState();
    updateCounters();
});
