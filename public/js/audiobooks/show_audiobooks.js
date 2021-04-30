var bookContainer = document.getElementsByClassName("audiobook-container");
var chapterContainer = document.getElementsByClassName("chapter-list-container");


function loadAudiobook(dir) {
    console.log("loadAudiobook("+dir+");");
    bookContainer[0].style.display = "none";
    chapterContainer[0].style.display = "inline-block";
    console.log(dir);
    var bookList = JSON.parse(loadFile("/audiobooks/index.json"));
    //put all the html into this string starting with the back button
    chapterContainer[0].innerHTML+=dir;

    //get the list of chapters
    var chapters = bookList.chapters;
    for (i in bookList) {
        console.log(bookList[i].chapters);
    }
}

function returnToBookMenu() {
    bookContainer[0].style.display = "inline-block";
    chapterContainer[0].style.display = "none";
}

//for loading the json index file
function loadFile(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
      result = xmlhttp.responseText;
    }
    return result;
  }