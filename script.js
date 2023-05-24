
let apiKey = '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'

// ПЕРЕМЕННЫЕ
let button = window.document.querySelector('button');
let p = window.document.querySelector('p');
let conversation = [];


// Для распознавания речи
let speechRecognizer = new webkitSpeechRecognition();


// Для синтез речи
let speechSynthesis = window.speechSynthesis;


// ФУНКЦИИ
const speech = () => {
speechRecognizer.start();
button.innerText = 'Говорите';
}
const talk = (text) => {
if ('speechSynthesis' in window) {
const textToTalk = new SpeechSynthesisUtterance(text);
textToTalk.rate = 1.1; // Скорость речи (0.1 - 10)
textToTalk.pitch = 1.0; // Высота тона речи (0 - 2)
textToTalk.volume = 1.0; // Громкость речи (0 - 1)
textToTalk.lang ='en-US', 'ru-RU'; // Язык речи (например, 'en-US', 'ru-RU')
textToTalk.voiceURI = 'Microsoft Zira Desktop'; // URI голоса (например, 'Microsoft Zira Desktop', 'Google UK English Female')
textToTalk.voice = speechSynthesis.getVoices()[0]; // Выбор конкретного голоса из доступных


// Получение доступных голосов
const voices = speechSynthesis.getVoices();


// Поиск женского голоса с наиболее нежной высотой тона
const femaleVoices = voices.filter((voice) => voice.gender === 'female');
const gentlestFemaleVoice = femaleVoices.reduce(
(gentlestVoice, currentVoice) =>
currentVoice.pitch < gentlestVoice.pitch ? currentVoice : gentlestVoice,
femaleVoices[0]
);


// Настройка голоса
textToTalk.voice = gentlestFemaleVoice;

speechSynthesis.speak(textToTalk);
} else {
console.error('Speech synthesis is not supported in this browser.');
}
};



// ИНТЕГРАЦИЯ С CHAT-GPT
const request = axios.create({
headers: {
Authorization: `Bearer ${apiKey}`,
},
});

const requestFunc = () => {
if (p.innerText) {
button.innerText = 'Отправка...';
button.style.animation = 'button_anim 2s infinite';

const message = {
role: 'user',
content: p.innerText,
};
conversation.push(message);

const params = {
model: 'gpt-3.5-turbo',
messages: conversation,
};

request
.post('https://api.openai.com/v1/chat/completions', params)
.then((response) => {
if (response.data && response.data.choices && response.data.choices.length > 0) {
const gptMessage = {
role: 'assistant',
content: response.data.choices[0].message.content,
};
conversation.push(gptMessage);

p.innerText = gptMessage.content;
button.innerText = 'Задать вопрос';
button.style.animation = 'none';

talk(p.innerText);
} else {
console.error('No response or empty choices from OpenAI API.');
}
})
.catch((error) => {
console.error('Error while making the request:', error);
});
}
};



// ОБРАБОТЧИКИ СОБЫТИЙ
speechRecognizer.onresult = (event) => {
if (event.results && event.results.length > 0) {
const transcript = event.results[0][0].transcript;
p.innerText = transcript;
requestFunc();
} else {
console.error('No speech recognition results available.');
}
};

// Функция для обновления состояния сети интернет
function updateNetworkStatus() {
    var statusText = document.getElementById("status-text");
  
    if (navigator.onLine) {
      statusText.textContent = "Подключено к интернету";
      statusText.style.color = "green";
    } else {
      statusText.textContent = "Нет подключения к интернету";
      statusText.style.color = "red";
    }
  }
  
  // Обработчики событий для изменения состояния сети
  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  
  // Вызов функции для обновления состояния сети при загрузке страницы
  updateNetworkStatus();
  
speechRecognizer.onerror = (event) => {
console.error('Speech recognition error:', event.error);
};


   // Функция для обновления даты и времени
   function updateDateTime() {
    var currentDateTimeElement = document.getElementById("currentDateTime");
    var now = new Date();
    var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' };
    var dateTimeString = now.toLocaleString('en-US', options);
    currentDateTimeElement.textContent = dateTimeString;
}

// Обновление даты и времени при загрузке страницы
updateDateTime();

// Обновление даты и времени каждую секунду
setInterval(updateDateTime, 1000);

