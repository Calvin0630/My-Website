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
    bookList: [],
    readAudiobookFiles: async function () {
        console.log("readAudiobookFiles();");
        try {
            var folders = fs.readdirSync(__dirname + '/public/audiobooks/');
        } catch (e) {
            console.log(e);
        }
        //var bookList = [];
        for (f in folders) {
            //ignore the index file
            if (folders[f] == "index.json") continue;
            info = folders[f].split(" - ");
            //read the contents of the folder into a list of filenames called chapters
            try {
                var chapters = fs.readdirSync(__dirname + '/public/audiobooks/' + folders[f] + "/");
            } catch (e) {
                console.log(e);
            }
            //filter out non mp3 files
            //a regex to match extensions
            var extRegex =/\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi;
            //a version of chapter only containing mp3 files
            chaptersFiltered = [];
            for (i in chapters) {
                var extension = chapters[i].match(extRegex);
                //if the file type is mp3
                if (extension == ".mp3") {
                    //add it to the filtered list
                    chaptersFiltered.push(chapters[i]);
                }
            }
            chapters=chaptersFiltered;
            //console.log("info: "+info[0]+", "+info[1]);
            //console.log("folders[f]: "+folders[f]);
            //console.log("chapters: "+chapters);
            var book = new Book(info[0], info[1], folders[f], chapters);
            //console.log(book);
            this.bookList.push(book);
        }
        //console.log(JSON.stringify(bookList));
        fs.writeFileSync(__dirname + '/public/audiobooks/index.json', JSON.stringify(this.bookList));
    }
};
function Book(title, author, location, chapters) {
    //(string) the name of the book
    this.title = title;
    //(string) take a guess
    this.author = author;
    //(string) The name of the folder in /public/audiobooks/ folder
    this.location = location;
    //(list of strings) a list of the chapters or sections of a book within their folder. 
    this.chapters = chapters;
}