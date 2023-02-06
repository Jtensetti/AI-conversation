// Initialize the Google Cloud Speech-to-Text and Text-to-Speech clients with the API key
const speechClient = new SpeechClient({
  key: 'AIzaSyBVeK3p4K4CvxJuuzn-bxdM7fbWFN_3C_Y'
});
const textToSpeechClient = new TextToSpeechClient({
  key: 'AIzaSyBVeK3p4K4CvxJuuzn-bxdM7fbWFN_3C_Y'
});

// Function to transcribe speech to text
async function transcribeSpeech(audio) {
  const request = {
    audio: {
      content: audio
    }
  };

  const [response] = await speechClient.recognize(request);
  return response.results.map(result => result.alternatives[0].transcript).join('\n');
}

// Function to synthesize text to speech
async function synthesizeText(text) {
  const request = {
    input: {
      text: text
    },
    voice: {
      languageCode: 'en-US',
      ssmlGender: 'NEUTRAL'
    },
    audioConfig: {
      audioEncoding: 'MP3'
    }
  };

  const [response] = await textToSpeechClient.synthesizeSpeech(request);
  return response.audioContent;
}

// Function to send a message to OpenAI and receive a response
async function sendMessageToOpenAI(message) {
  const response = await fetch(
    'https://api.openai.com/v1/engines/text-davinci-002/jobs',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer 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`
      },
      body: JSON.stringify({
        prompt: message,
        max_tokens: 1000,
        n: 1,
        stop: '\n',
        temperature: 0.5
      })
    }
  );
  const json = await response.json();
  return json.choices[0].text;
}

// Function to handle the user speaking
async function handleUserSpeak(event) {
  const audio = event.results[0][0].audio;
  const message = await transcribeSpeech(audio);
  const response = await sendMessageToOpenAI(message);
  const speech = await synthesizeText(response);
  const audioElement = new Audio(speech);
  audioElement.play();
}

// Start listening for user speech
const speechRecognition = new webkitSpeechRecognition();
speechRecognition.interimResults = false;
speechRecognition.continuous = false;
speechRecognition.onresult = handleUserSpeak;

// Start the speech recognition
speechRecognition.start();

// Function to handle user input from the text box
async function handleUserText(event) {
  event.preventDefault();
  const message = document.querySelector('#message').value;
  const response = await sendMessageToOpenAI(message);
  const speech = await synthesizeText(response);
  const audioElement = new Audio(speech);
  audioElement.play();
}

// Attach the event listener to the form submit button
const form = document.querySelector('form');
form.addEventListener('submit', handleUserText);

// Function to display the message on the page
function displayMessage(text, isUser) {
  const messages = document.querySelector('#messages');
  const div = document.createElement('div');
  div.innerText = text;
  div.classList.add(isUser ? 'user-message' : 'chatbot-message');
  messages.appendChild(div);
}
