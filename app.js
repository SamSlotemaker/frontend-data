const
    express = require('express')
path = require('path')
app = express()
const port = 8000;

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/public/index.html'));
})


console.log(`app running on port ${port}`)
app.listen(port)