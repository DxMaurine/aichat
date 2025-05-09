document.addEventListener('DOMContentLoaded', function() {
    const chatDisplay = document.getElementById('chatDisplay');
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    const clearButton = document.getElementById('clearButton');
    const suggestionButtons = document.querySelectorAll('.suggestion-btn');
    const modelSelector = document.getElementById('modelSelector');
    
    // Konfigurasi OpenRouter
    const OPENROUTER_API_KEY = "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"; // Ganti dengan API key Anda
    const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
    
    // Fungsi untuk menambahkan pesan ke chat
    function addMessage(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${role}-message`);
        messageDiv.textContent = content;
        chatDisplay.appendChild(messageDiv);
        chatDisplay.scrollTop = chatDisplay.scrollHeight;
    }
    
    // Fungsi untuk mendapatkan respons dari OpenRouter
    async function getAIResponse(prompt, model) {
        try {
            const response = await fetch(OPENROUTER_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.href, // Required by OpenRouter
                    'X-Title': 'AI Prompt Generator' // Optional
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{role: "user", content: prompt}]
                })
            });
            
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error("Error fetching AI response:", error);
            return "Maaf, terjadi kesalahan saat memproses permintaan Anda.";
        }
    }
    
    // Fungsi untuk mengirim pesan
    async function sendMessage() {
        const message = userInput.value.trim();
        if (message) {
            addMessage('user', message);
            userInput.value = '';
            
            // Tampilkan indikator typing
            const typingIndicator = document.createElement('div');
            typingIndicator.id = 'typingIndicator';
            typingIndicator.textContent = "AI sedang mengetik...";
            typingIndicator.classList.add('message', 'ai-message');
            chatDisplay.appendChild(typingIndicator);
            chatDisplay.scrollTop = chatDisplay.scrollHeight;
            
            // Dapatkan model yang dipilih
            const selectedModel = modelSelector.value;
            
            // Dapatkan respons dari AI
            try {
                const aiResponse = await getAIResponse(message, selectedModel);
                
                // Hapus indikator typing dan tampilkan respons
                chatDisplay.removeChild(typingIndicator);
                addMessage('ai', aiResponse);
            } catch (error) {
                chatDisplay.removeChild(typingIndicator);
                addMessage('ai', "Maaf, terjadi kesalahan: " + error.message);
            }
        }
    }
    
    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    clearButton.addEventListener('click', function() {
        chatDisplay.innerHTML = '';
    });
    
    // Tambahkan contoh prompt ke input saat tombol diklik
    suggestionButtons.forEach(button => {
        button.addEventListener('click', function() {
            userInput.value = this.textContent;
            userInput.focus();
        });
    });
});