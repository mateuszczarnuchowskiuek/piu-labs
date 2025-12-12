import * as Helpers from './helpers.js';

class Store {
    #state = {
        shapes: [],
    };

    #subscribers = new Set();

    #STORAGE_KEY = 'lab5-shapes-data';

    constructor() {
        this.#loadFromStorage();
    }

    get shapes() {
        return [...this.#state.shapes];
    }

    get squaresCount() {
        return this.#state.shapes.filter((s) => s.type === 'square').length;
    }

    get circlesCount() {
        return this.#state.shapes.filter((s) => s.type === 'circle').length;
    }

    getShape(id) {
        return this.#state.shapes.find((s) => s.id === id);
    }

    subscribe(callback) {
        this.#subscribers.add(callback);
        callback('INIT', this.shapes);
    }

    #notify(action, data) {
        this.#saveToStorage();

        for (const callback of this.#subscribers) {
            callback(action, data);
        }
    }

    addShape(type) {
        const newShape = {
            id: Helpers.generateId(),
            type: type,
            color: Helpers.randomHsl(),
        };

        this.#state.shapes.push(newShape);

        this.#notify('ADD', newShape);
    }

    removeShape(id) {
        this.#state.shapes = this.#state.shapes.filter(
            (shape) => shape.id !== id
        );

        this.#notify('REMOVE', id);
    }

    recolor(type) {
        this.#state.shapes.forEach((shape) => {
            if (shape.type === type) {
                shape.color = Helpers.randomHsl();
            }
        });

        this.#notify('RECOLOR', type);
    }

    #saveToStorage() {
        localStorage.setItem(this.#STORAGE_KEY, JSON.stringify(this.#state));
    }

    #loadFromStorage() {
        const data = localStorage.getItem(this.#STORAGE_KEY);
        if (data) {
            this.#state = JSON.parse(data);
        }
    }
}

const store = new Store();
export default store;
