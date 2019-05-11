import React from 'react';

export default class Player extends React.PureComponent {
    constructor(username, type) {
        super();

        this.type = type;
        this.username = username;
        this.movesArr = 0;
        this.currentTurn = false;
    }

    static get winningNumbers() {
        return [7, 56, 448, 73, 146, 292, 273, 84];
    }

    setTurn(turn) {
        this.currentTurn = turn;
        return turn ? 'now it\'s your turn!' : 'please wait for the other player...';
    }

    getPlayerUserName() {
        return this.username;
    }

    getPlayer() {
        return this.type;
    }

    getMovesArr() {
        return this.movesArr;
    }

    getTurn() {
        return this.currentTurn;
    }

    updatePlaysArr(value) {
        this.movesArr += value;
    }

    render() { return null; }
}
