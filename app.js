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

// about page
app.get('/about', function(req, res) {
    res.render('pages/about');
});

// shader demo
app.get('/shader-demo', function(req, res) {
    res.render('pages/shader-demo');
});

// moon
app.get('/moon', function(req, res) {
    res.render('pages/moon');
});


app.listen(app.get("port"), function () {
    console.log("server started on port: " + app.get("port"));
});