const connectToMongo = require('./db');

const express = require('express')
var cors = require('cors')
connectToMongo();

const app = express()
const port = 5000

app.use(cors())
cors({credentials: true, origin: true})
app.use(express.json())  //middleware

// Custom middleware to set Access-Control-Allow-Origin header
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   next();
// });

app.use('/api/auth', require('./routes/auth'))
app.use('/api/notes', require('./routes/notes'))

// app.use('Access-Control-Allow-Origin':'*');


app.listen(port, () => {
  console.log(`iNotebook backend listening on port http://localhost:${port}`)
})

