const port = 3003

const bodyParser = require('body-parser')
const express = require('express')
const server  = express()
const allowCors = require('./cors')
const queryParser = require('express-query-int') // esse cara serve para usar na paginação
/* importar o módulo do express-validator */
const expressSession = require('express-session');

//middleware
server.use(bodyParser.urlencoded({ extended: true }))
server.use(bodyParser.json())
server.use(allowCors)
// vai dar um parser na query string e converter o que estive lá como número para inteiro
server.use(queryParser())

/* configura o middleware express-session */
server.use(expressSession({
	secret: 'R1T2E4d5t6t7S8E5d3g5g6e7YIGHKgf5dDDFGdfg4jdEW2FBM1ikÇH',
	resave: false,
	saveUninitialized: false
}));

server.listen(port, function(){
  console.log(`BACKEND is running on port ${port}.`)
})

module.exports = server
