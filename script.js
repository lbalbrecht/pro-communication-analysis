var sampleText = "First, the good news: The Moderna vaccine will likely be going into people's arms Monday, boosting the number of Americans who will start getting inoculated against Covid-19. Here is more text in that vein. I do not know why the first text didn't work. Here's a negative sentence, everyone hates you and you should die.";


$(document).ready(function () {
    $("#user-text").submit(function (event) {
        // prevent default form behavior
        event.preventDefault();
        $.ajax({
            // data is the text the user entered
            data: $("#textarea1").val(),
            // my server that handles the authenticated api request
            url: "http://34.83.70.58:5000/",
            method: "POST"
        }).then(function (response) {
            console.log(response);
        })
    })
})