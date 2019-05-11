const server = require('http').createServer();
const io = require('socket.io')(server);

// game id
let gameId = 1;

io.on('connection', (socket) => {
    // 1. Host the game
    socket.on('hostGame', (data) => {
        socket.join(`game-${gameId}`);
        socket.emit('newGame', { username: data.username, game: `game-${gameId}` });
        gameId++;
    });

    //  2. P2 joins the game
    socket.on('joinGame', (data) => {
        const games = data.game ? io.nsps['/'].adapter.rooms[data.game] : [];

        if (games && games.length == 1) {
            socket.join(data.game);
            socket.to(data.game).emit('p1');
            socket.emit('p2', { username: data.username, game: data.game });
        } else {
            socket.emit('err', { message: 'Game already has started!' });
        }
    });

    // 3. On player turn
    socket.on('playerTurn', ({ row, col, game }) => {
        socket.broadcast.to(game).emit('playerPlayed', {
            row, col, game,
        });
    });

    // 4. Avengers: Endgame
    socket.on('endGame', (data) => {
        socket.broadcast.to(data.game).emit('gameEnded', data);
    });
});

server.listen(4000);
