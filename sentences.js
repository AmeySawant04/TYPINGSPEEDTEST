require('dotenv').config();

async function fetchQoute() {
    try {
        const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
            headers: { 'X-Api-Key': process.env.NINJASENTENCES_API_KEY }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log(data); 
        return data[0].quote; // Correct key to access the sentence
    } catch (error) {
        console.error('Error fetching sentence:', error);
    }
}
async function fetchAdvice() {
    try {
        const response = await fetch('https://api.api-ninjas.com/v1/advice', {
            headers: { 'X-Api-Key': process.env.NINJASENTENCES_API_KEY }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log(data);
        return data.advice; // Correct key to access the sentence
    } catch (error) {
        console.error('Error fetching sentence:', error);
    }
}
async function fetchDadJoke() {
    try {
        const response = await fetch('https://api.api-ninjas.com/v1/dadjokes', {
            headers: { 'X-Api-Key': process.env.NINJASENTENCES_API_KEY }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log(data); 
        return data[0].joke; // Correct key to access the sentence
    } catch (error) {
        console.error('Error fetching sentence:', error);
    }
}
async function fetchFacts() {
    try {
        const response = await fetch('https://api.api-ninjas.com/v1/facts', {
            headers: { 'X-Api-Key': process.env.NINJASENTENCES_API_KEY }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        // console.log(data); 
        return data[0].fact; // Correct key to access the sentence
    } catch (error) {
        console.error('Error fetching sentence:', error);
    }
}

async function fetchSentences(length) {
    minlen = 0;
    maxlen = 0;
    sentences = [];

    switch (length) {
        case 0: // length between 40 - 120 characters
            minlen = 39;
            maxlen = 121;
            break;

        case 1: //length between 100 - 280
            minlen = 99;
            maxlen = 281;
            break;

        case 2: //length between 280 - 350
            minlen = 279;
            maxlen = 301;
        default:
            console.error("Invalid length of the sentence.\nfetchSentence method can take either 0, 1, 2 as an (length) argument")
            break;
    }

    // fetching process
        quote = await fetchQoute();
        advice = await fetchAdvice();
        dadJoke = await fetchDadJoke();
        fact = await fetchFacts();


        // console.log("fact: ", fact);
        // console.log("advice: ", advice);
        // console.log("dadJoke: ", dadJoke);
        // console.log("quote: ", quote);


        //Push eligible length sentences
        if (fact.length > minlen && fact.length < maxlen){
            sentences.push(fact);
            // console.log("fact: ", fact);
        }
        if(advice.length > minlen && advice.length < maxlen){
            sentences.push(advice);
            // console.log("advice: ", advice);
        }
        if(dadJoke.length > minlen && dadJoke.length < maxlen){
            sentences.push(dadJoke);
            // console.log("dadJoke: ", dadJoke);
        }
        if(quote.length > minlen && quote.length < maxlen){
            sentences.push(quote);
            // console.log("quote: ", quote);
        }
        
    

        if(sentences.length < 1){
            return fetchSentences(length);
        }
    // console.log('sentences: ', sentences);

    console.log("successfully sentences created");
    return sentences;
}


// Test the function

// fetchSentences(1);

module.exports = { fetchSentences };