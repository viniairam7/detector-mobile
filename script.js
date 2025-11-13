// ----------------------------------------------------------
// FUNÇÃO: Abrir apps no iOS com base no texto digitado
// ----------------------------------------------------------
function abrirAppBaseadoNoTexto(texto) {
    texto = texto.toLowerCase();
    let appAberto = '';

    if (texto.includes('data') || texto.includes('aniversário') || texto.includes('feriado') || texto.includes('reunião')) {
        window.location.href = 'calshow://'; // Calendário iOS
        appAberto = 'Calendário';

    } else if (texto.includes('tempo') || texto.includes('cronômetro') || texto.includes('minutos') || texto.includes('horas')) {
        window.location.href = 'clock://'; // Relógio iOS
        appAberto = 'Relógio / Cronômetro';

    } else if (texto.includes('mensagem') || texto.includes('ligação') || texto.includes('whatsapp')) {
        window.location.href = 'https://wa.me/'; // WhatsApp
        appAberto = 'WhatsApp';

    } else if (texto.includes('anotação') || texto.includes('nota') || texto.includes('notas')) {
        window.location.href = 'mobilenotes://'; // Notas iOS
        appAberto = 'Notas';
    }

    return appAberto;
}


// ----------------------------------------------------------
// FUNÇÃO: Adicionar mensagem ao chat
// ----------------------------------------------------------
function addMessageToChat(text, sender) {
    const chatContainer = document.getElementById('chat');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}


// ----------------------------------------------------------
// FUNÇÃO: Agendar a notificação normal (10 min)
// ----------------------------------------------------------
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

                } else {
                    resolve('default');
                }
            });

        } else {
            console.warn('Navegador não suporta notificações.');
            resolve('not-supported');
        }
    });
}


// ----------------------------------------------------------
// FUNÇÃO: Notificação do detector (1 minuto)
// 🚨 COMPRA SUSPEITA — BLOQUEIE O CARTÃO IMEDIATAMENTE
// ----------------------------------------------------------
function scheduleSuspiciousPurchaseNotification() {

    if ('serviceWorker' in navigator && 'Notification' in window) {
        setTimeout(() => {
            navigator.serviceWorker.ready.then(registration => {
                registration.showNotification('🚨 Compra suspeita', {
                    body: 'BLOQUEIE O CARTÃO IMEDIATAMENTE',
                    icon: './icon-192.png',
                    tag: 'compra-suspeita'
                });
            });
        }, 1 * 60 * 1000); // 1 minuto
    }
}


// ----------------------------------------------------------
// FUNÇÃO PRINCIPAL: quando o usuário envia mensagem
// ----------------------------------------------------------
function handleUserInput() {
    const inputElement = document.getElementById('userInput');
    const userText = inputElement.value.trim();

    if (userText) {

        // 1. Mostrar mensagem do usuário
        addMessageToChat(userText, 'user');

        // 2. Disparar notificação do detector (1 min)
        scheduleSuspiciousPurchaseNotification();

        // 3. Abrir app relacionado
        const appSuggestion = abrirAppBaseadoNoTexto(userText);

        // 4. Agendar notificação padrão do Remember Me
        scheduleNotification(userText).then(notificationStatus => {

            let botResponse = `Lembrete "${userText}" registrado!`;

            if (appSuggestion) {
                botResponse += ` Abrindo ${appSuggestion}.`;
            } else {
                botResponse += ` Não encontrei um app específico, mas o lembrete foi agendado.`;
            }

            if (notificationStatus === 'granted') {
                botResponse += ` Você será lembrado em 10 minutos.`;
            } else if (notificationStatus === 'denied') {
                botResponse += ` Notificações bloqueadas. Ative para receber lembretes.`;
            } else {
                botResponse += ` Permissão de notificação pendente.`;
            }

            addMessageToChat(botResponse, 'bot');
        });

        // 5. Limpar input
        inputElement.value = '';

    } else {
        addMessageToChat("Ops! Você não digitou nada. O que devo lembrar?", 'bot');
    }
}
