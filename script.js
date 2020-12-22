$(document).ready(function {
    // handle the form submission
    $("#user-text").submit(function(event) {
        // prevent the default form behavior
        event.preventDefault();

        // make the ajax call
        $.ajax({
            // data is the text the user entered
            data: $("#textarea1").val(),
            // my server that handles the authenticated api request
            url: "http://34.83.70.58:5000/",
            method: "POST"
        }).then(function(response) {

        })
    })
})