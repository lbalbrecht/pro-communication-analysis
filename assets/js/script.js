$(document).ready(function () {
    // handle the form submission
    $("#user-text").submit(function (event) {
        // prevent the default form behavior
        event.preventDefault();

        $("#response").empty();
        $(".modal-holder").empty();

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
    for (var i = 0; i < sentiment.sentences.length; i++) {
        var sentenceSpan = $("<span>");
        sentenceSpan.addClass(`sentence sentence-${i} tooltipped`);
        sentenceSpan.attr("data-position", "right");
        // TODO better description than sentiment magnitude
        sentenceSpan.attr("data-tooltip", `Sentiment Magnitude: ${sentiment.sentences[i].sentiment.magnitude.toFixed(2)}`);
        sentenceSpan.text(sentiment.sentences[i].text.content);
        if (sentiment.sentences[i].sentiment.score > 0) {
            var redAndBlue = Math.floor(256 * (1 - sentiment.sentences[i].sentiment.score));
            sentenceSpan.css("background-color", `rgb(${redAndBlue}, 255, ${redAndBlue})`);
        } else if (sentiment.sentences[i].sentiment.score < 0) {
            var greenAndBlue = Math.floor(256 * (1 + sentiment.sentences[i].sentiment.score));
            sentenceSpan.css("background-color", `rgb(255, ${greenAndBlue}, ${greenAndBlue})`);
        }
        $("#response").append(sentenceSpan);
        $("#response").append(" ");
    }
    $(".tooltipped").tooltip();
}

// TODO display the entities and entity sentiment=
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
                        // console.log(before);
                        // console.log(after);
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

        var modalDiv = $("<div>").attr("id", `entity-modal-${i}`).addClass("modal")
            .append($("<div>").addClass("modal-content").append($("<div>").addClass("modal-header")
                .append($("<h4>").text(entitySentiment.entities[i].name),
                    $("<a>").attr("href", "#!").addClass("modal-close").append($("<span>").addClass("material-icons").text("close"))),
                $("<div>").addClass("modal-sentiment"), $("<div>").addClass("wiki-content")),
                $("<div>").addClass("modal-footer"))
            .appendTo($(".modal-holder"));
        // $(".modal-holder").append(`<div class="modal" id=entity-modal-${i}><div class="modal-content"><p>${JSON.stringify(entitySentiment.entities[i])}</p></div></div>`);

        // Call the displayWikiExtract function for each entity with a Wikipedia URL
        displayWikiExtract(entitySentiment.entities[i], modalDiv);
    }
    $(".entity").hover(function () {
        $(`.entity-${$(this).attr("data-index")}`).addClass("entity-hover");
    }, function () {
        $(`.entity-${$(this).attr("data-index")}`).removeClass("entity-hover");
    })
    $(".modal").modal();
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

                // TODO display the data
                console.log(wiki.extract);
                console.log(modal.html());

                modal.find(".wiki-content").append($("<h5>").text(wiki.title), $("<p>").text(wiki.extract.substr(0, 1000))
                    .append(" ... ", $("<a>").text("Read more on Wikipedia").attr("href", entity.metadata.wikipedia_url).attr("target", "_blank")));
            });
    }
}
