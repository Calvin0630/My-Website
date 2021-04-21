console.log("hello");
var buttons = document.getElementsByClassName("sidebar-button");
let activeButton = sessionStorage.getItem('active-sidebar-btn');
if (activeButton==null || activeButton=='null') {
    //set it to 0 (Home)
    defaultButton=0;
    sessionStorage.setItem('active-sidebar-btn',defaultButton);
    activeButton=defaultButton;
    console.log("no active button set. assigning the home button.");
}
setButtonColor(activeButton);
console.log("activeButton: "+activeButton);
for (i = 0; i < buttons.length; i++) {
    console.log(buttons[i].textContent);
}

/*Sets the color of the given button by index, j (0=top)*/
function setButtonColor(j) {
    console.log("setActiveBtnColor("+j+")");
    var i;
    for (i = 0; i < buttons.length; i++) {
        if (j == i) {
            buttons[i].className = "sidebar-button active";
        }
        else {
            buttons[i].className = "sidebar-button";
        }
    }
}

function setActiveButtonIndex(j) {
    sessionStorage.setItem('active-sidebar-btn',j);
}
