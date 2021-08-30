
var express = require("express");
var path = require("path");
var indexAudiobook = require("./IndexAudiobooks");


app = express();
app.set("port", process.env.port || 3000);
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');
// Include partials middleware into the server
app.use(express.static(__dirname + '/public'));

//read the contents of ./public/audiobooks/ and the store the book info in a json to be read in html
indexAudiobook.readAudiobookFiles();

// use res.render to load up an ejs view file

// index page
app.get('/', function (req, res) {
    res.render('pages/index');
});
// audiobook page
app.get('/audiobooks', function (req, res) {
    res.render('pages/browse-audiobooks', {
        bookList: indexAudiobook.bookList
    });
});
app.get('/listen-to-audiobook', function (req, res) {
    res.render('pages/listen-to-audiobook', {
        location: req.query["book-loc"],
        bookList: indexAudiobook.bookList
    });
});
// shader demo
app.get('/shader-demo', function (req, res) {
    res.render('pages/shader-demo');
});
// mycology
app.get('/mycology', function (req, res) {
    res.render('pages/mycology');
});

app.listen(app.get("port"), function () {
    console.log("server started on port: " + app.get("port"));
});