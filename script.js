let apiKey = 'тут должен бытть ваш api ключь '

// ПЕРЕМЕННЫЕ
let button = window.document.querySelector('button');
let p = window.document.querySelector('p');
let conversation = JSON.parse(localStorage.getItem('conversation') || '[]');

const setDefaultButton = () => {
  button.innerHTML = '<i class="fas fa-microphone"></i>';
  button.classList.remove('listening');
  button.style.animation = 'none';
};

setDefaultButton();


// Для распознавания речи (кроссбраузерная инициализация)
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;
let speechRecognizer = SpeechRecognition ? new SpeechRecognition() : null;
let isListening = false;
if (!speechRecognizer) {
  console.error('Speech recognition is not supported in this browser.');
}

if (speechRecognizer) {
  speechRecognizer.onstart = () => {
    isListening = true;
  };
  speechRecognizer.onend = () => {
      isListening = false;
      setDefaultButton();
  };
}


// Для синтез речи
let speechSynthesis = window.speechSynthesis;
const voiceSelect = document.getElementById('voiceSelect');
const rateInput = document.getElementById('rate');
const pitchInput = document.getElementById('pitch');
const volumeInput = document.getElementById('volume');
let voices = [];
const chatHistory = document.getElementById('chat-history');
const themeSwitch = document.getElementById('theme-switch');
const clearHistoryBtn = document.getElementById('clear-history-btn');

const populateVoices = () => {
  voices = speechSynthesis.getVoices();
  if (!voices.length) return;
  voiceSelect.innerHTML = '';
  voices.forEach((voice) => {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
  const savedVoice = localStorage.getItem('voice');
  if (savedVoice && voices.find((v) => v.name === savedVoice)) {
    voiceSelect.value = savedVoice;
  } else if (voices.length > 0 && !voiceSelect.value) {
    voiceSelect.value = voices[0].name;
  }
};

speechSynthesis.onvoiceschanged = populateVoices;
populateVoices();

voiceSelect.addEventListener('change', () => {
  localStorage.setItem('voice', voiceSelect.value);
});

rateInput.value = localStorage.getItem('rate') || '1';
pitchInput.value = localStorage.getItem('pitch') || '1';
volumeInput.value = localStorage.getItem('volume') || '1';

rateInput.addEventListener('input', () => {
  localStorage.setItem('rate', rateInput.value);
});

pitchInput.addEventListener('input', () => {
  localStorage.setItem('pitch', pitchInput.value);
});

volumeInput.addEventListener('input', () => {
  localStorage.setItem('volume', volumeInput.value);
});

const saveConversation = () => {
  localStorage.setItem('conversation', JSON.stringify(conversation));
};

const updateChatHistory = () => {
  if (!chatHistory) return;
  chatHistory.innerHTML = conversation
    .map((msg) => `<div class="${msg.role}">${msg.role === 'user' ? 'Вы' : 'ИИ'}: ${msg.content}</div>`)
    .join('');
};

updateChatHistory();

const applyTheme = (theme) => {
  document.body.classList.toggle('light-theme', theme === 'light');
  localStorage.setItem('theme', theme);
  if (themeSwitch) themeSwitch.checked = theme === 'light';
};

const savedTheme = localStorage.getItem('theme') || 'dark';
applyTheme(savedTheme);

if (themeSwitch) {
  themeSwitch.addEventListener('change', () => {
    applyTheme(themeSwitch.checked ? 'light' : 'dark');
  });
}

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', () => {
    conversation = [];
    saveConversation();
    updateChatHistory();
  });
}


// ФУНКЦИИ


const speech = () => {
  if (!speechRecognizer) {
    talk('Ваш браузер не поддерживает распознавание речи');
    return;
  }
    if (isListening) {
      speechRecognizer.stop();
      speechSynthesis.cancel();
      setDefaultButton();
    } else {
      speechRecognizer.start();
      button.classList.add('listening');
    }
  isListening = !isListening;
};

const talk = (text) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    const selectedVoice = voices.find((voice) => voice.name === voiceSelect.value);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    }
    utterance.rate = parseFloat(rateInput.value);
    utterance.pitch = parseFloat(pitchInput.value);
    utterance.volume = parseFloat(volumeInput.value);

    utterance.onstart = () => {
      if (speechRecognizer && isListening) {
          speechRecognizer.stop();
          isListening = false;
          setDefaultButton();
      }
    };

    utterance.onend = () => {
      if (speechRecognizer && !isListening) {
          speechRecognizer.start();
          isListening = true;
          button.classList.add('listening');
      }
    };

    speechSynthesis.speak(utterance);
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
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';//----- отправка
    button.classList.remove('listening');

const message = {
role: 'user',
content: p.innerText,
};
conversation.push(message);
saveConversation();
updateChatHistory();

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
saveConversation();
updateChatHistory();

p.innerText = gptMessage.content;
  setDefaultButton();

talk(p.innerText);
} else {
console.error('No response or empty choices from OpenAI API.');
}
})
.catch((error) => {
console.error('Error while making the request:', error);
talk('Произошла ошибка при обращении к серверу');
});
}
};


function toggleVisibility() {
  var paragraph = document.getElementById("hidden-paragraph");
  var controls = document.getElementById("voice-controls");
  var history = document.getElementById("chat-history");
  var actions = document.getElementById("menu-actions");
  if (paragraph.style.display === "none") {
    paragraph.style.display = "block";
    controls.style.display = "block";
    history.style.display = "block";
    if (actions) actions.style.display = "block";
  } else {
    paragraph.style.display = "none";
    controls.style.display = "none";
    history.style.display = "none";
    if (actions) actions.style.display = "none";
  }
}




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


// Создаем новый элемент div
var statusIcon = document.createElement("div");

// Устанавливаем идентификатор элемента
statusIcon.id = "status-icon";

// Добавляем элемент в тело документа
document.body.appendChild(statusIcon);

var statusText = document.getElementById("status-text");


// Функция для обновления состояния сети интернет
function updateNetworkStatus() {
  var statusIcon = document.getElementById("status-icon");
  if (navigator.onLine) {
    statusIcon.innerHTML = '<i class="fas fa-wifi" style="color: #16bacf;"></i>';
    if (statusText) statusText.textContent = 'Online';
  } else {
    statusIcon.innerHTML = '<i class="fas fa-wifi" style="color: red;"></i>';
    if (statusText) statusText.textContent = 'Offline';
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
    var dateTimeString = now.toLocaleString('en-EN', options);
    currentDateTimeElement.textContent = dateTimeString;
}

// Обновление даты и времени при загрузке страницы
updateDateTime();

// Обновление даты и времени каждую секунду
setInterval(updateDateTime, 1000);

