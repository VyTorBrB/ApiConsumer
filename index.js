const app = require('express')()
    , http = require('http').createServer(app)
    , io = require('socket.io')(http)
    , port = 3001
    , endPoint = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/9ab77582-700d-4ab2-9de6-eb289166cd8f?verbose=true&timezoneOffset=-360&subscription-key=35f119b87c414a50890ab1fc49b20cf3&q='
    , Axios = require('axios')

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/html/index.html')
})

const accessLuis = async (msg) => {
    const res = await Axios.get(endPoint + `{${msg}}`)
        .then(res => {
            console.log('inside accessluis')
            return res.data.topScoringIntent
        })
        .catch(err => console.log(err))
    return res
}

io.emit('chat message', { for: 'everyone' })
io.on('connection', socket => {
    //socket.write('Conexao bem sucedida!')
    socket.on('chat message', msg => {
        const onCall = async (msg) => {
            const topScore = await accessLuis(msg)
            console.log(topScore)

            switch (topScore.intent) {
                case 'saudacao':
                    {
                        console.log('message: ' + 'Ola, Em que posso ajuda-lo?')
                        socket.emit('chat message', 'Ola, Em que posso ajuda-lo?')
                    }
                    break;

                default:
                    socket.emit('chat message', 'Desculpe nao entendi')
                    break;
            }
        }
        console.log(msg)
        onCall(msg)
    })
    socket.broadcast.emit('chat message')
    console.log('Connection stabillished')
    socket.on('disconnect', () => console.log('Connection terminated'))
})

http.listen(port, () => `server executing on port: ${port}`)