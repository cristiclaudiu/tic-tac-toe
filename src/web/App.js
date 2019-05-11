import React from 'react';
import io from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

import Game from './components/Game';
import Player from './components/Player';
import MyModal from './components/MyModal';

const socket = io.connect('http://localhost:4000');
const P1 = 'X';
const P2 = '0';
let player;
let game;

class App extends React.PureComponent {

    state = {
        playerName: '',
        opponentName: '',
        message: '',
        gameId: null,
        gameStarted: false,
        board: [
   ['', '', ''],
   ['', '', ''],
   ['', '', ''],
        ],
        moves: 1,
        nextPlayer: null,
        modalShow: false,
        modalMessage: '',
        reloadGame: 0
    };

    constructor(props) {
        super(props);

        this.newGame = this.newGame.bind(this);
        this.joinGame = this.joinGame.bind(this);
        this.handleSquareClick = this.handleSquareClick.bind(this);
        this.handleOnNameChange = this.handleOnNameChange.bind(this);
        this.showModal = this.showModal.bind(this);
    }

    componentDidMount() {
        socket.on('newGame', (data) => {
            game = new Game(data.game, player, socket);
            this.setState({ gameStarted: true, message: `Hi ${player.getPlayerUserName()}, the game has started! Please ask player 2, to enter this game id: ${data.game}, and click 'Join Game'` });
        });

        socket.on('p1', (data) => {
            this.setState({ message: player.getPlayerUserName(), nextPlayer: player.setTurn(true) });
        });

        socket.on('p2', (data) => {
            game = new Game(data.game, player, socket);
            this.setState({ gameStarted: true, message: player.getPlayerUserName(), nextPlayer: player.setTurn(false) });
        });

        socket.on('playerPlayed', ({ row, col }) => {
            const opponentType = player.getPlayer() === P1 ? P2 : P1;

            this.updateGame(opponentType, row, col);
            this.setState({ nextPlayer: player.setTurn(true) });
        });

        socket.on('gameEnded', (data) => {
            this.showModal(data.message, 1);
        });

        socket.on('err', (data) => {
            if (!game) return this.showModal('No games were found!');
            this.showModal(data.message, 1);
        });
    }

    showModal(message, reload = 0) {
        this.setState({
            modalShow: true,
            modalMessage: message,
            reloadGame: reload
        });
    }

    updateGame(type, row, col) {
        const { board, moves } = this.state;

        board[row][col] = type;
        this.setState({ nextPlayer: player.setTurn(false), board, moves: moves + 1 });
    }

    handleSquareClick(row, col) {
        const { moves } = this.state;

        if (!player.getTurn()) {
            this.showModal('Please wait for your turn!');
            return;
        }

        socket.emit('playerTurn', { row, col, game: game.getGameId() });
        this.updateGame(player.getPlayer(), row, col);

        player.setTurn(false);
        player.updatePlaysArr(1 << ((row * 3) + col));

        const winnerMessage = game.checkWinner();

        const gameDraw = 'Game Draw!';

        if (winnerMessage) {
            this.showModal(winnerMessage, 1);
        }else if (moves >= 9) {
            socket.emit('endGame', {
                game: game.getGameId(),
                message: gameDraw,
            });
            this.showModal(gameDraw, 1);
        }
    }

    newGame() {
        const { playerName } = this.state;
        if (!playerName) {
            this.showModal('Enter your username!');
            return;
        }
        socket.emit('hostGame', { username: playerName });
        player = new Player(playerName, P1);
    }

    joinGame() {
        const { opponentName, gameId } = this.state;

        if (!opponentName || !gameId) {
            this.showModal('Please enter your username and enter the game ID!');
            return;
        }

        socket.emit('joinGame', { username: opponentName, game: gameId });
        player = new Player(opponentName, P2);
    }

    handleOnNameChange(player, username) {
        this.setState({ [player]: username });
    }

    render() {
        const { gameStarted, message, nextPlayer, board, modalMessage, reloadGame } = this.state;

        return (
    <div className="container">
        <MyModal reloadgame={reloadGame} show={this.state.modalShow} onHide={() => this.setState({ modalShow: false })} modalmessage={modalMessage} />
     { !gameStarted && (
           <div className="row">
               <div className="col-6">
                   <div className="input-group">
                       <input type="text" onChange={e => this.handleOnNameChange('playerName', e.target.value)} className="form-control" required placeholder="Enter your username" aria-label="Enter your username" aria-describedby="basic-addon2" />
                           <div className="input-group-append">
                               <button onClick={this.newGame} className="btn btn-outline-secondary" type="button">Host Game</button>
                           </div>
                   </div>
               </div>
               <div className="col-6">
                   <div className="input-group">
                       <input type="text" onChange={e => this.setState({ gameId: e.target.value })} className="form-control" placeholder="Enter Game ID" aria-label="Enter Game ID" aria-describedby="basic-addon2" />
                       <input type="text" onChange={e => this.handleOnNameChange('opponentName', e.target.value)} className="form-control" placeholder="Enter your username" aria-label="Enter your username" aria-describedby="basic-addon2" />
                           <div className="input-group-append">
                               <button onClick={this.joinGame} className="btn btn-outline-secondary" type="button">Join Game</button>
                           </div>
                   </div>
               </div>
           </div>
     ) }
     {
      gameStarted && (
        <div className="container">
         <p>{ message }, { nextPlayer }</p>
         <table className="mx-auto table-dark">
          <tbody>
           { board.map((row, rowIdx) => {
               return (
              <tr key={rowIdx}>
               {
                row.map((col, colIdx) => {
                    return (
                   <td key={`${rowIdx}_${colIdx}`}>
                    <button disabled={col} className="game-square" onClick={() => this.handleSquareClick(rowIdx, colIdx)}>
                     { col }
                    </button>
                   </td>
                    );
                })
               }
              </tr>
               );
           }) }
          </tbody>
         </table>
        </div>
      )
     }
    </div>
        );
    }
}

function AppWrapper() {
    return new App();
}

export default AppWrapper;
