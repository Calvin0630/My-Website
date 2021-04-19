//source: https://nodejs.dev/learn/how-to-exit-from-a-nodejs-program
/*
console.log('Hello World');

const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send('Hi!')
})

const server = app.listen(3000, () => console.log('Server ready'))

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Process terminated')
  })
})
*/
//source: https://www.w3schools.com/nodejs/nodejs_get_started.asp

/*
var http = require('http');

http.createServer(function (req, res) {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('Hello World!');
}).listen(8080);

*/