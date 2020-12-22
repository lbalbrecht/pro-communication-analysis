$(document).ready(function () {
    // handle the form submission
    $("#user-text").submit(function (event) {
        // prevent the default form behavior
        event.preventDefault();

        // make the ajax call
        $.ajax({
            // data is the text the user entered
            data: $("#textarea1").val(),
            // my server that handles the authenticated api request
            url: "http://34.83.70.58:5000/",
            method: "POST"
        }).then(function (response) {
            // call the display functions with the response data
            displaySentiment(response.sentiment);
            dispplayEntities(response.entities);
            displayEntitySentiment(response.entitySentiment);
            displaySyntax(response.syntax);
        });
    });
});

// TODO display the sentiment
function displaySentiment(sentiment) {

}

// TODO display the entities
function dispplayEntities(entities) {

}

// TODO display the entity sentiment
// might combine with display entities depending on how we use it
function displayEntitySentiment(entitySentiment) {

}

// TODO process and potentially display syntax data
function displaySyntax(syntax) {

}