var fs = require("fs");
var mm = require('music-metadata');
var util = require('util');
module.exports = {
    foo: function () {
        // whatever
    },
    bar: function () {
        // whatever
    },
    bookList:[],
    readAudiobookFiles: async function () {
        console.log("it works");
        let files = fs.readdirSync(__dirname + '/public/audiobooks/');
        //var bookList = [];
        for (f in files) {
            //ignore the index file
            if (files[f] == "index.json") continue;
            info = files[f].split(" - ");
            var chapters = fs.readdirSync(__dirname + '/public/audiobooks/' + files[f] + "/");
            //console.log("info: "+info[0]+", "+info[1]);
            //console.log("files[f]: "+files[f]);
            //console.log("chapters: "+chapters);
            var book = new Book(info[0], info[1], files[f], chapters);
            //console.log(book);
            this.bookList.push(book);
        }
        //console.log(JSON.stringify(bookList));
        fs.writeFileSync(__dirname + '/public/audiobooks/index.json', JSON.stringify(this.bookList));
    }
};
function Book (title, author, location, chapters) {
    //(string) the name of the book
    this.title = title;
    //(string) take a guess
    this.author = author;
    //(string) The name of the folder in /public/audiobooks/ folder
    this.location = location;
    //(list of strings) a list of the chapters or sections of a book within their folder. 
    this.chapters = chapters;
}