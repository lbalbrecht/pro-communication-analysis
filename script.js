

$(document).ready(function () {
    // handle the form submission
    $("#user-text").submit(function (event) {
        // prevent the default form behavior
        event.preventDefault();
        var inputText = $("#textarea1").val()
        console.log(inputText)
        

        localStorage.setItem("text", inputText)
        
        // make the ajax call
        $.ajax({
            // data is the text the user entered
            data: $("#textarea1").val(),
            // my server that handles the authenticated api request
            url: "http://34.83.70.58:5000/",
            method: "POST",
        }).then(function (response) {
            
                // display the results on a button click
                $("#feedback").show()
                $("#response").append(inputText)
                // $("#submission").hide()

            // call the display functions with the response data
            displaySentiment(response.sentiment);
            displayEntitySentiment(response.entitySentiment);
        });
        $("#clear-button").click(function(d) {
            d.preventDefault()
            if(confirm("Would you like to start over?")) {
                $("#textarea1").val('')
                $(inputText).val('')
                $("#response").val('')
                // $("#feedback").hide()
                localStorage.clear()
            }
    });
    
});

})

// TODO display the sentiment
function displaySentiment(sentiment) {
    // Display the overall sentiment magnitude and score
    console.log(sentiment.documentSentiment.magnitude);
    console.log(sentiment.documentSentiment.score);
    // Display magnitude and score for each sentence in the text
    for(i=0; i<sentiment.sentences.length; i++){
        console.log(sentiment.sentences[i].text);
        console.log(sentiment.sentences[i].sentiment.magnitude);
        console.log(sentiment.sentences[i].sentiment.score);

        
    }

}

// TODO display the entities and entity sentiment=
function displayEntitySentiment(entitySentiment) {
    for(i=0; i<entitySentiment.entities.length; i++){
        // Call the displayWikiExtract function for each entity with a Wikipedia URL
        displayWikiExtract(entitySentiment.entities[i])
        // Grab the magnitude and score for each entity in the text
        console.log(entitySentiment.entities[i].sentiment.score);
        console.log(entitySentiment.entities[i].sentiment.magnitude);
    }

}


// use the url of a wikipedia page from an entity and the wikipedia api
// to get an object with the title of the page and the intro as an extract
// set the wiki data as a property of the entity for future reference
function displayWikiExtract(entity) {
    // make sure this entity has a wikipedia url
    if (entity.metadata.wikipedia_url != undefined) {
        // replace the page url with the api url and my parameters
        // keeping the domain ([language].wikipedia.org) and the title the same
        // for cross language compatability
        $.getJSON(entity.metadata.wikipedia_url.replace("wiki/", "w/api.php?action=query&prop=extracts&exintro&explaintext&format=json&origin=*&titles="),
            function (response) {
                // there should only be one page returned, so we get the first one
                var wiki = Object.values(response.query.pages)[0];

                // TODO display the data
                console.log(wiki.extract);
            });
    }
}