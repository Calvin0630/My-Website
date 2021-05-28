var buttons = document.getElementsByClassName("header-button");
let activeButton = sessionStorage.getItem('active-header-btn');
//if the button hasnt been assigned
if (activeButton == null || activeButton == 'null') {
    defaultButton = 0;
    sessionStorage.setItem('active-header-btn', defaultButton);
    activeButton = defaultButton;
    console.log("no active button set. assigning the home button.");
}
//find the page and set the button # accordingly
page = window.location.href.match(/(?<!\?.+)(?<=\/)[\w-]+(?=[/\r\n?]|$)/g);
//console.log("page: \'" + page+"\'");
switch (page) {
    case null:
        activeButton = 0;
        //console.log("home!");
        break;
    case "audiobooks":
        activeButton = 1;
        //console.log("audiobooks!");
    case "listen-to-audiobook":
        activeButton = 1;
        //console.log("listen-to-audiobook!");
        break;
    case "shader-demo":
        activeButton = 2;
        //console.log("shader-demo!");
        break;

    default:
        //console.log("default");

}
//console.log("activeButton: " + activeButton);
setButtonColor(activeButton);

for (i = 0; i < buttons.length; i++) {
    ////console.log(buttons[i].textContent);
}

/*Sets the color of the given button by index, j (0=top)*/
function setButtonColor(j) {
    ////console.log("setActiveBtnColor("+j+")");
    var i;
    for (i = 0; i < buttons.length; i++) {
        if (j == i) {
            buttons[i].className = "header-button active";
        }
        else {
            buttons[i].className = "header-button";
        }
    }
}

function setActiveButtonIndex(j) {
    sessionStorage.setItem('active-header-btn', j);
}

function toggleHeader() {
    console.log("toggleHeader()");
}