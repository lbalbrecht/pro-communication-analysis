# re:Analysis

## Description

Bootcamp Project 1: A language-analysis application for professional communications

Emails are an integral part of professional and business operations; however, a significant amount of subtext is lost in a written message, particularly the tone of the message itself. This can present challenges when an employee unintentionally sends an email that the recipient could interpret negatively or combatively.

Cloud Natural Language is an API that analyzes language and provides information about the perceived tone of the message through a machine-learning-derived understanding of colloquial speech.

[Deployed on GitHub Pages](https://lbalbrecht.github.io/pro-communication-analysis/).


## Usage

Enter the text of your email or other professional communication in the input field and press re:Analyze. The color in our feedback section represents the positivity of the text, and the magnitude value represents the amount of sentiment. Click on entities (basically any noun) to view sentiment information for how that entity is described in the text, as well as more information about that entity from [Wikipedia](https://wikipedia.org) when available.

![re:Analysis Landing Page](assets/Screenshots/landing-page.png?raw=true "Landing Page")

re:Analysis Landing Page

![re:Analysis Sample Feedback](assets/Screenshots/sample-response.png?raw=true "Sample Feedback")

Sample feedback from re:Analysis

## Built With:

[Materialize:](https://materializecss.com/getting-started.html) - CSS framework used
[Google Cloud's Natural Language API:](https://cloud.google.com/natural-language) - Used for sentiment analysis, entity recognition, and entity sentiment data
[Wikipedia API:](https://www.mediawiki.org/wiki/API:Main_page) - Took in entity recognition data and returned information entity information when available.

## Authors: 

-Leighton Albrecht 
-John Jacobson
-Rachel Nelson-Schille






