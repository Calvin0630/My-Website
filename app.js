
var express = require("express");
var path = require("path");
var fs = require("fs");


app = express();
app.set("port", process.env.port || 3000);
app.set("views", path.join(__dirname, "views"));
app.set('view engine', 'ejs');
// Include partials middleware into the server
app.use(express.static(__dirname + '/public'));

readAudiobookFiles()

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

function readAudiobookFiles() {

    let files = fs.readdirSync(__dirname +'/public/audiobooks/');
    let mp3Regex = /([a-zA-Z0-9\s_\\.\-\(\):])+(.mp3)$/;
    for (f in files) {
        //if its an mp3
        if (mp3Regex.test(files[f])) {
            console.log("mp3: "+ files[f]);
        }
        //otherwise assume its a directory
        else {
            console.log("folder: "+ files[f]);
        }
    }
    console.log("full list");
    console.log(files);
}

function Book() {
    this.title;
    this.filename
    this.author;
    this.directory;
    this.oneFile
}