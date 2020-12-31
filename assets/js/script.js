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

            // display the results on a button click
            $("#feedback").show();

            // call the display functions with the response data
            displaySentiment(response.sentiment);
            displayEntitySentiment(response.entitySentiment);
        });

    });

    $("#clear-button").click(function (d) {
        d.preventDefault()
        if (confirm("This will clear everything. Would you like to start over?")) {
            $("#textarea1").val('');
            $("#response").empty();
        }
    });
    $("#save-button").click(function (s) {
        s.preventDefault();
        var inputText = $("#textarea1").val();
        localStorage.setItem("text", inputText);
    })
    $("#load-button").click(function (l) {
        l.preventDefault();
        var savedText = localStorage.getItem("text");
        $("#textarea1").val(savedText);
    })

    function autoSave() {
        localStorage.setItem("autosave", $("#textarea1").val());
    }

    $("#textarea1").keyup(autoSave);
    $("#textarea1").change(autoSave);

    $("#textarea1").val(localStorage.getItem("autosave"));


});

// display the sentiment
// TODO display magnitude
function displaySentiment(sentiment) {
    // display document score
    $("#score-bar").css("left", `${Math.round(sentiment.documentSentiment.score * 50)}%`);
    // display document magnitude
    $("#document-score").addClass("tooltipped").attr("data-position", "top").attr("data-tooltip", `Sentiment Magnitude: ${sentiment.documentSentiment.magnitude.toFixed(2)}`);

    // display each sentence with color for the score
    // display magnitude on hover
    // TODO add paragraph breaks from submitted text
    $("#response").empty();
    for (var i = 0; i < sentiment.sentences.length; i++) {
        var sentenceSpan = $("<span>");
        sentenceSpan.addClass(`sentence sentence-${i} tooltipped`);
        sentenceSpan.attr("data-position", "right");
        // TODO better description than sentiment magnitude
        sentenceSpan.attr("data-tooltip", `Sentiment Magnitude: ${sentiment.sentences[i].sentiment.magnitude.toFixed(2)}`);
        sentenceSpan.text(sentiment.sentences[i].text.content);
        if (sentiment.sentences[i].sentiment.score > 0) {
            var redAndBlue = Math.floor(256 * (1-sentiment.sentences[i].sentiment.score));
            sentenceSpan.css("background-color", `rgb(${redAndBlue}, 255, ${redAndBlue})`);
        } else if (sentiment.sentences[i].sentiment.score < 0) {
            var greenAndBlue = Math.floor(256 * (1+sentiment.sentences[i].sentiment.score));
            sentenceSpan.css("background-color", `rgb(255, ${greenAndBlue}, ${greenAndBlue})`);
        }
        $("#response").append(sentenceSpan);
        $("#response").append(" ");
    }
    $(".tooltipped").tooltip();
}

// TODO display the entities and entity sentiment=
function displayEntitySentiment(entitySentiment) {
    for (i = 0; i < entitySentiment.entities.length; i++) {
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
