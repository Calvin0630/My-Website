var fs = require("fs");
var mm = require('music-metadata');
var util = require('util');
module.exports = {
    bookList: [],
    readAudiobookFiles: async function () {
        //console.log("readAudiobookFiles();");
        try {
            var folders = fs.readdirSync(__dirname + '/public/audiobooks/');
        } catch (e) {
            console.log(e);
        }
        for (f in folders) {
            //ignore the index file
            if (folders[f] == "index.json") continue;
            info = folders[f].split(" - ");
            //read the contents of the folder into a list of filenames called chapters
            try {
                var chapterNames = fs.readdirSync(__dirname + '/public/audiobooks/' + folders[f] + "/");
            } catch (e) {
                console.log(e);
            }
            //filter out non mp3 files
            //a regex to match extensions
            var extRegex = /\.([0-9a-z]+)(?=[?#])|(\.)(?:[\w]+)$/gmi;
            //a version of chapterNames only containing mp3 files
            chapterNamesFiltered = [];
            for (i in chapterNames) {
                var extension = chapterNames[i].match(extRegex);
                //if the file type is mp3
                if (extension == ".mp3") {
                    //add it to the filtered list
                    chapterNamesFiltered.push(chapterNames[i]);
                }
            }
            chapterNames = chapterNamesFiltered;
            //check if there are multiple chapters (some books have just one audio file)
            //
            trackIndices = [];
            if (chapterNames.length > 1) {
                console.log(folders[f]);
                //a list of track numbers that corresponds element-wise to eachj chapter
                trackIndices = [];
                //go through each chapter and read metadata to get track #
                for (i in chapterNames) {
                    try {
                        var metadata = await mm.parseFile(__dirname + "/public/audiobooks/" + folders[f] + "/" + chapterNames[i]);
                        //console.log(util.inspect(metadata, { showHidden: false, depth: null }));
                        //console.log("\t" + chapterNames[i]);
                        //console.log("\ttrack#:  " + metadata.common.track.no);
                        trackIndices.push(metadata.common.track.no);
                    } catch (error) {
                        console.error(error.message);
                    }
                }
                console.log(trackIndices.join());
                chapterNames = sortChapters(chapterNames, trackIndices);
            }


            //console.log("info: "+info[0]+", "+info[1]);
            //console.log("folders[f]: "+folders[f]);
            //console.log("chapters: "+chapters);
            var book = new Book(info[0], info[1], folders[f], chapterNames);
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

//this function takes two arrays, an array of track #s and an array of chapter names that correspond element-wise.
//this functionb sorts both arrays based on 
function sortChapters(chapterNames, trackIndices) {
    var result = [];
    var cList = [];
    //create a list of objects that contain the chapter name and track #
    for (i in chapterNames) {
        cList.push({chapter: chapterNames[i], track: trackIndices[i]});
    }
    //sort it
    cList.sort((a, b) => (a.track > b.track) ? 1 : -1);
    //create a new list of just the sorted chapter names
    for (i in cList) {
        result.push(cList[i].chapter);
    }
    return result;
}