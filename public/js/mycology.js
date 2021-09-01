var mycoData;
var selectionParameters = {};
ReadMushroomJSON();
jQuery(function () {
    $("#mushroom_list_box").text("hello");
    $("#render_mushrooms_btn").click(function () {
        console.log("mycoData[0].name: " + mycoData[0].name);
        console.log("mycoData[0].hymeniumType: " + mycoData[0].hymeniumType);
        console.log("mycoData[0].capShape: " + mycoData[0].capShape);
        console.log("mycoData[0].whichGills: " + mycoData[0].whichGills);
        console.log("mycoData[0].stipeCharacter: " + mycoData[0].stipeCharacter);
        console.log("mycoData[0].sporePrintColor: " + mycoData[0].sporePrintColor);
        console.log("mycoData[0].ecologicalType: " + mycoData[0].ecologicalType);
        console.log("mycoData[0].howEdible: " + mycoData[0].howEdible);
        $("#mushroom_list_box").text("uwu");
    });
});

function ReadMushroomJSON() {
    //read mycology/mycological_characteristics.json asynchronously
    async function loadJSON(url) {
        const res = await fetch(url);
        return await res.json();
    }

    loadJSON('./mycological_characteristics.json').then(data => {
        mycoData = data;
    });

    
}