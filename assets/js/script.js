$(document).ready(function () {
    // handle the form submission
    $(".tooltipped").tooltip();
    $('.modal').modal();

    $("#user-text").submit(function (event) {
        // prevent the default form behavior
        event.preventDefault();
        $("#instructions").hide(250);
        $("#response").empty();
        $(".modal-holder").empty();

        // make the ajax call
        $.ajax({
            // data is the text the user entered
            data: $("#textarea1").val(),
            // my server that handles the authenticated api request
            url: "https://re-analysis.com:5443/",
            method: "POST"
        }).then(function (response) {

            // display the results on a button click
            $("#feedback").show(250);

            // call the display functions with the response data
            displaySentiment(response.sentiment);
            displayEntitySentiment(response.entitySentiment);
        });

    });

    // Clear user's text from input field if they click "yes"
    $("#delete").click(function () {
        $("#feedback").hide(250, function () {
            $("#response").empty();
            $("#textarea1").val('');
            $("label[for=textarea1").removeClass("active");
            M.textareaAutoResize($('#textarea1'));
        })
    })

    $("#save-button").click(function (s) {
        s.preventDefault();
        // Manually save user's text to local storage
        var inputText = $("#textarea1").val();
        localStorage.setItem("text", inputText);
    });

    $("#load-button").click(function (l) {
        l.preventDefault();
        // Load saved text to user input field
        var savedText = localStorage.getItem("text");
        $("#textarea1").val(savedText);
        if ($("#textarea1").val().length > 0) {
            $("label[for=textarea1").addClass("active");
        }
        M.textareaAutoResize($('#textarea1'));
    });

    function autoSave() {
        // Automatically save text to local storage as user types
        localStorage.setItem("autosave", $("#textarea1").val());
    }

    $("#textarea1").keyup(autoSave);
    $("#textarea1").change(autoSave);

    $("#textarea1").val(localStorage.getItem("autosave"));
    if ($("#textarea1").val().length > 0) {
        $("label[for=textarea1").addClass("active");
    }
    M.textareaAutoResize($('#textarea1'));


});

// display the sentiment
// TODO display magnitude
function displaySentiment(sentiment) {
    // display document score
    $("#document-score-bar").css("left", `${Math.round(sentiment.documentSentiment.score * 50)}%`);
    // display document magnitude
    $("#document-score-scale").addClass("tooltipped").attr("data-position", "top").attr("data-tooltip", `Sentiment Magnitude: ${sentiment.documentSentiment.magnitude.toFixed(2)}`);

    // display each sentence with color for the score
    // display magnitude on hover
    // TODO add paragraph breaks from submitted text
    for (var i = 0; i < sentiment.sentences.length; i++) {
        var sentenceSpan = $("<span>");
        sentenceSpan.addClass(`sentence sentence-${i} tooltipped`);
        sentenceSpan.attr("data-position", "right");
        // TODO better description than sentiment magnitude
        sentenceSpan.attr("data-tooltip", `Sentiment Magnitude: ${sentiment.sentences[i].sentiment.magnitude.toFixed(2)}`);
        sentenceSpan.text(sentiment.sentences[i].text.content);
        if (sentiment.sentences[i].sentiment.score > 0) {
            sentenceSpan.css("background-color", `rgba(255, 109, 0, ${Math.abs(sentiment.sentences[i].sentiment.score)})`);
        } else if (sentiment.sentences[i].sentiment.score < 0) {
            sentenceSpan.css("background-color", `rgba(30, 136, 229, ${Math.abs(sentiment.sentences[i].sentiment.score)})`);
        }
        $("#response").append(sentenceSpan);
        $("#response").append(" ");
    }

    $(".tooltipped").tooltip();

}

// display the entities and entity sentiment
function displayEntitySentiment(entitySentiment) {
    for (var i = 0; i < entitySentiment.entities.length; i++) {
        for (var j = 0; j < entitySentiment.entities[i].mentions.length; j++) {
            // html already checked for this entity mention
            var before = "";
            // html to check for this entity mention
            var after = $("#response").html();
            // escape regex special characters in the mention and use it as a regex pattern requiring word boundary characters before and after
            var mentionRegExp = new RegExp(`(\\b|')${entitySentiment.entities[i].mentions[j].text.content.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1")}(\\b|')`);
            var found = false;
            // should always be found before after.length == 0 but check just in case to prevent errors
            while (!found && after.length > 0) {
                // skip over html tags
                if (after.startsWith("<")) {
                    var toSkip = after.match(/<.+?>/)[0];
                    // if the tag is the span for an entity, skip everything in that span
                    if (toSkip.includes("entity")) {
                        toSkip = after.match(/<a.*?>.*?<\/a>/)[0];
                    }
                    // move the tag to the checked variable
                    before += toSkip;
                    after = after.substr(toSkip.length);
                } else {
                    // select everything until the next html tag
                    var nextTag = after.indexOf("<");
                    var toSearch;
                    if (nextTag > 0) {
                        toSearch = after.substr(0, nextTag);
                    } else {
                        toSearch = after;
                    }
                    var matchIndex = toSearch.search(mentionRegExp);
                    // if the entity mention is found
                    if (matchIndex >= 0) {
                        // add tags around the entity mention and move it to before
                        before += `${toSearch.substr(0, matchIndex)}<a class="entity entity-${i} modal-trigger" href="#entity-modal-${i}" data-index="${i}" data-position="bottom" data-tooltip="Entity ${i}">${entitySentiment.entities[i].mentions[j].text.content}</a>`;
                        // after is now the string starting at index of the match index plus the length of the mention
                        after = after.substr(matchIndex + entitySentiment.entities[i].mentions[j].text.content.length);
                        // entity mention has been found
                        found = true;
                    } else {
                        // move the text that was searched
                        before += toSearch;
                        after = after.substr(toSearch.length);
                    }
                }
            }

            $("#response").html(before + after);
        }

        // create modal for the entity
        var modalSentiment = $("<div>").addClass("modal-sentiment");
        var modalWiki = $("<div>").addClass("wiki-content");

        var modalContent = $("<div>").addClass("modal-content").append($("<div>").addClass("modal-header")
            .append(
                $("<h4>").text(entitySentiment.entities[i].name),
                $("<a>").attr("href", "#!").addClass("modal-close").append($("<span>").addClass("material-icons").text("close"))),
            modalSentiment, modalWiki);

        $("<div>").attr("id", `entity-modal-${i}`).addClass("modal").append(modalContent).appendTo($(".modal-holder"));

        // display sentiment
        var entitySentimentScale = $("<div>").addClass("score-scale").appendTo(modalSentiment);
        var entityScoreBar = $("<div>").addClass("score-bar").appendTo(entitySentimentScale);
        entityScoreBar.css("left", `${Math.round(entitySentiment.entities[i].sentiment.score * 50)}%`);
        entitySentimentScale.addClass("tooltipped").attr("data-position", "top").attr("data-tooltip", `Sentiment Magnitude: ${entitySentiment.entities[i].sentiment.magnitude.toFixed(2)}`)

        // Call the displayWikiExtract function for each entity with a Wikipedia URL
        displayWikiExtract(entitySentiment.entities[i], modalWiki);
    }

    $(".entity").hover(function () {
        $(`.entity-${$(this).attr("data-index")}`).addClass("entity-hover");
    }, function () {
        $(`.entity-${$(this).attr("data-index")}`).removeClass("entity-hover");
    })
    $(".modal").modal();
    $(".tooltipped").tooltip();
}


// use the url of a wikipedia page from an entity and the wikipedia api
// to get an object with the title of the page and the intro as an extract
// set the wiki data as a property of the entity for future reference
function displayWikiExtract(entity, modal) {
    // make sure this entity has a wikipedia url
    if (entity.metadata.wikipedia_url != undefined) {
        // replace the page url with the api url and my parameters
        // keeping the domain ([language].wikipedia.org) and the title the same
        // for cross language compatability
        $.getJSON(entity.metadata.wikipedia_url.replace("wiki/", "w/api.php?action=query&prop=extracts&exintro&explaintext&format=json&origin=*&titles="),
            function (response) {
                // there should only be one page returned, so we get the first one
                var wiki = Object.values(response.query.pages)[0];

                // display the data
                modal.append($("<h5>").text(wiki.title), $("<p>").text(wiki.extract.substr(0, 1000))
                    .append($("<a>").text(" ... Read more on Wikipedia").attr("href", entity.metadata.wikipedia_url).attr("target", "_blank")));
            });
    }
}
