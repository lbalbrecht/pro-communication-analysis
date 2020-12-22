
// Grabs the "submit" button
var submitButton = $("#submit-button");

var sampleText = "First, the good news: The Moderna vaccine will likely be going into people's arms Monday, boosting the number of Americans who will start getting inoculated against Covid-19. Here is more text in that vein. I do not know why the first text didn't work. Here's a negative sentence, everyone hates you and you should die.";

var queryURL = "https://sentim-api.herokuapp.com/api/v1/";

var entityURL = "https://api.dandelion.eu/datatxt/nex/v1/?lang=en&text=" + sampleText + "&token=fbcac4b6dc234d639b4e5d6c14191f7f";




$.ajax({
    url: queryURL,
    method: "POST",
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
    },
    data: JSON.stringify({
        text: sampleText
    })
  }).then(function(response){
      console.log(response);

      console.log(response.sentences[0].sentiment.type);

      for(i=0; i<response.sentences.length; i++){
          if(response.sentences[i].sentiment.polarity<0){
              console.log("You're a jerk")
          }
          else{
              console.log("Nah you're good");
          }
      }
    
  })

  $.ajax({
      url: entityURL,
      method: "POST",
      data: sampleText
  }).then(function(response){
      console.log(response);
  })
