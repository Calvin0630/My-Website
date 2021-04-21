var express = require("express");
var partials = require('express-partials');
var path = require("path");

app = express();
app.set("port", process.env.port || 3000);
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');
// Include partials middleware into the server
app.use(express.static(__dirname + '/public'));



// use res.render to load up an ejs view file

// index page
app.get('/', function(req, res) {
    res.render('pages/index');
});

// audiobook page
app.get('/audiobooks', function(req, res) {
    res.render('pages/leftist-audiobooks');
});

// shader demo
app.get('/shader-demo', function(req, res) {
    res.render('pages/shader-demo');
});


app.listen(app.get("port"), function () {
    console.log("server started on port: " + app.get("port"));
});