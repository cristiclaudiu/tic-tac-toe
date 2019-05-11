import React from 'react';

import Player from './Player';

export default class Game extends React.PureComponent {
    constructor(gameId, player, socket) {
        super();

        this.socket = socket;
        this.gameId = gameId;
        this.player = player;
    }

    getGameId() {
        return this.gameId;
    }

    checkWinner() {
        const currentPlayerPositions = this.player.getMovesArr();
        let message = '';

        Player.winningNumbers.forEach((winning) => {
            if ((winning & currentPlayerPositions) === winning) {
                message = `${this.player.getPlayerUserName()} has won the game!`;
                this.socket.emit('endGame', {
                    game: this.getGameId(),
                    message,
                });
            }
        });

        return message;
    }

    render() {
        return null;
    }
}
