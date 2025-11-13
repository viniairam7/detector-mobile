// script.js
function abrirAppBaseadoNoTexto(texto) {
    texto = texto.toLowerCase();

    // Adiciona uma variável para armazenar o nome do app para feedback ao usuário
    let appAberto = '';

    if (texto.includes('data') || texto.includes('aniversário') || texto.includes('feriado') || texto.includes('reunião')) {
        window.location.href = 'calshow://'; // iOS Calendar
        appAberto = 'Calendário';
    } else if (texto.includes('tempo') || texto.includes('cronômetro') || texto.includes('minutos') || texto.includes('horas')) {
        window.location.href = 'clock://'; // iOS Clock
        appAberto = 'Relógio / Cronômetro';
    } else if (texto.includes('mensagem') || texto.includes('ligação') || texto.includes('whatsapp')) {
        window.location.href = 'https://wa.me/';
        appAberto = 'WhatsApp';
    } else if (texto.includes('anotação') || texto.includes('nota') || texto.includes('notas')) {
        window.location.href = 'mobilenotes://'; // iOS Notes
        appAberto = 'Notas';
    }
    return appAberto; // Retorna o nome do app aberto
}

// Função para lidar com a entrada do usuário e agendar o lembrete
function handleUserInput() {
    const inputElement = document.getElementById('userInput');
    const userText = inputElement.value.trim();

    if (userText) {
        // 1. Exibir a mensagem do usuário no chat
        addMessageToChat(userText, 'user');

        // 2. Chamar a função para abrir o app relacionado e obter o nome do app
        const appSuggestion = abrirAppBaseadoNoTexto(userText);

        // 3. Agendar notificação de lembrete e obter feedback sobre a notificação
        scheduleNotification(userText).then(notificationStatus => {
            let botResponse = `Lembrete "${userText}" registrado!`;

            if (appSuggestion) {
                botResponse += ` Abrindo ${appSuggestion}.`;
            } else {
                botResponse += ` Não encontrei um aplicativo específico, mas seu lembrete foi agendado.`;
            }

            if (notificationStatus === 'granted') {
                botResponse += ` Você será lembrado em 10 minutos.`;
            } else if (notificationStatus === 'denied') {
                botResponse += ` Não pude agendar a notificação, por favor, habilite as notificações para receber lembretes.`;
            } else { // 'default' ou outro estado
                botResponse += ` Permissão de notificação pendente. Por favor, aceite para receber lembretes.`;
            }
            // Exibir a resposta do bot
            addMessageToChat(botResponse, 'bot');
        });


        // 4. Limpar o input
        inputElement.value = '';
    } else {
        // Mensagem do bot se o input estiver vazio
        addMessageToChat("Ops! Parece que você não digitou nada. O que devo lembrar?", 'bot');
    }
}

// Função para adicionar mensagens ao chat
function addMessageToChat(text, sender) {
    const chatContainer = document.getElementById('chat');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight; // Rolar para a última mensagem
}

// Função para agendar a notificação
// Retorna uma Promise que resolve com o status da permissão de notificação
function scheduleNotification(message) {
    return new Promise(resolve => {
        if ('serviceWorker' in navigator && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setTimeout(() => {
                        navigator.serviceWorker.ready.then(registration => {
                            registration.showNotification('Lembrete do Me Lembre!', {
                                body: `Você escreveu: "${message}"`,
                                icon: './icon-192.png',
                                tag: 'lembrete-me-lembre'
                            });
                        });
                    }, 10 * 60 * 1000); // 10 minutos
                    resolve('granted');
                } else if (permission === 'denied') {
                    resolve('denied');
                } else { // 'default'
                    resolve('default');
                }
            });
        } else {
            console.warn('Service Worker ou Notificações não suportadas neste navegador.');
            resolve('not-supported'); // Novo status para navegadores sem suporte
        }
    });
}
