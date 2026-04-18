document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('decision-input');
    const btnSavage = document.getElementById('btn-savage');
    const btnLogical = document.getElementById('btn-logical');
    const btnExistential = document.getElementById('btn-existential');
    const responseContainer = document.getElementById('response-container');
    const responseTypeLabel = document.getElementById('response-type-label');
    const responseText = document.getElementById('response-text');

    let isTyping = false;

    const buttons = {
        savage: btnSavage,
        logical: btnLogical,
        existential: btnExistential
    };
    
    const originalContent = {
        savage: '<span class="icon">🔥</span> Savage',
        logical: '<span class="icon">🧠</span> Logical',
        existential: '<span class="icon">💀</span> Existential Crisis'
    };

    function setButtonsState(disabled, loadingType = null) {
        Object.keys(buttons).forEach(key => {
            const btn = buttons[key];
            btn.disabled = disabled;
            if (disabled) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
                if (key === loadingType) {
                    btn.innerHTML = '<span class="icon">⏳</span> Thinking...';
                }
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
                btn.innerHTML = originalContent[key];
            }
        });
    }

    // Response databases for different personas
    const responses = {
        savage: [
            "**🔥 ERROR 404: Logic Not Found**\n\nBecause your track record of good decisions is just **flawless**, right?\n\nI could explain why this is a terrible idea, but I don't have enough processing power to comprehend that level of stupidity.\n\nSure, do it. Future you needs something to cry about to their therapist anyway.",
            "**🔥 The Path of Maximum Resistance**\n\nI've analyzed 14 million possible outcomes, and in exactly **zero** of them does this end well for you.\n\nIt's almost impressive how you consistently choose the worst possible option.\n\nGo for it, champ. We all love a good trainwreck."
        ],
        logical: [
            "**🧠 Reconsideration Advised**\n\nBased on available data, the risk-to-reward ratio here is highly skewed towards **risk**.\n\nLet's break this down: Cost is high, probability of success is low, and long-term benefits are nonexistent.\n\nThe math simply doesn't check out. I recommend performing a cost-benefit analysis before proceeding.",
            "**🧠 Statistical Anomaly**\n\nWhile emotionally appealing in the short term, this action contradicts your established **long-term goals**.\n\nStatistically speaking, impulsive decisions yield negative results 87% of the time.\n\nYou are currently aiming to be in that 87%. Immediate abort recommended."
        ],
        existential: [
            "**💀 Into the Void**\n\nDoes it really matter? In 5 billion years the sun will expand and swallow the Earth, erasing all evidence of this **mistake**.\n\nYou are a momentary speck of consciousness in an indifferent universe. Do it or don't. The void remains unchanged.\n\nWhy do you seek validation from a machine?",
            "**💀 Branching Timelines**\n\nWe are all just pretending to know what we're doing until our inevitable return to **cosmic dust**.\n\nEvery choice creates a new branching timeline. In most of them, you are still fundamentally unfulfilled.\n\nProceed, if it briefly distracts you from the absurdity of reality."
        ]
    };

    function getRandomResponse(type) {
        const pool = responses[type];
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function typeWriterEffect(text, speed = 15) {
        return new Promise(resolve => {
            let htmlText = text
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '<br><br>')
                .replace(/\n/g, '<br>');

            responseText.innerHTML = '';
            let i = 0;
            
            function type() {
                if (i <= htmlText.length) {
                    if (htmlText.charAt(i) === '<') {
                        let tagClose = htmlText.indexOf('>', i);
                        if (tagClose !== -1) {
                            i = tagClose + 1;
                        }
                    }
                    responseText.innerHTML = htmlText.substring(0, i) + '<span class="cursor"></span>';
                    
                    if (i < htmlText.length) {
                        i++;
                        setTimeout(type, speed + (Math.random() * 10));
                    } else {
                        responseText.innerHTML = htmlText;
                        resolve();
                    }
                }
            }
            type();
        });
    }

    async function generateAIResponse(input, mode) {
        // TODO: Replace with your actual Gemini API key
        const apiKey = 'YOUR_API_KEY';
        
        // If no API key is provided, fallback to the simulated response
        if (apiKey === 'YOUR_API_KEY') {
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(getRandomResponse(mode));
                }, 1500); 
            });
        }

        // Analyze input for risk level
        const lowerInput = input.toLowerCase();
        let riskTag = "";
        
        if (/\b(quit|drop|break up|skip)\b/.test(lowerInput)) {
            riskTag = "\n[System Context: This is a high risk decision]";
        } else if (/\b(food|sleep|eat|pizza|burger|nap|coffee)\b/.test(lowerInput)) {
            riskTag = "\n[System Context: This is a low risk decision]";
        }

        // The system prompt logic provided
        const prompt = `You are an AI that critiques user decisions in a brutally honest way.

User decision: "${input}"
Mode: "${mode}"${riskTag}

Rules based on mode:
If mode is "savage": Be brutally honest, sarcastic, slightly funny. Roast the user but stay intelligent. End with a punchline.
If mode is "logical": Break down the decision rationally. Show pros and cons, risks and consequences. Give a clear verdict.
If mode is "existential": Respond in a deep, philosophical, slightly dramatic tone. Question the meaning behind it.

CRITICAL FORMATTING INSTRUCTIONS:
- First line MUST be a bold headline reaction using markdown (e.g., **🔥 The Ultimate Mistake**)
- Then: 2-4 short paragraphs separated by a blank line.
- Add emojis matching the tone (🔥 for savage, 🧠 for logical, 💀 for existential).
- Highlight key phrases in **bold** using markdown.
- Keep the total response under 120 words.
- Do NOT wrap the response in a markdown code block.`;

        try {
            // Making the request to Google Gemini API
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }]
                })
            });

            const data = await response.json();
            if (data.candidates && data.candidates[0].content.parts[0].text) {
                return data.candidates[0].content.parts[0].text;
            }
            return "Error: Could not generate a response. The void remains silent.";
        } catch (error) {
            console.error("API Error:", error);
            return "Error: Connection to the AI failed. You're on your own with this terrible decision.";
        }
    }

    async function handleAction(type) {
        const decision = inputField.value.trim();
        
        if (!decision) {
            inputField.style.borderColor = '#ff4500';
            setTimeout(() => {
                inputField.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }, 500);
            return;
        }

        if (isTyping) return;
        isTyping = true;
        
        setButtonsState(true, type);

        // Setup UI
        responseContainer.classList.remove('hidden', 'theme-savage', 'theme-logical', 'theme-existential');
        
        // Trigger reflow to restart animation
        void responseContainer.offsetWidth;
        
        responseContainer.classList.add('visible', `theme-${type}`);
        
        const labels = {
            savage: "Savage AI Analysis",
            logical: "Logical AI Analysis",
            existential: "Existential AI Analysis"
        };
        
        responseTypeLabel.textContent = labels[type];
        responseText.innerHTML = '';
        
        // Generate response tailored to input
        const reply = await generateAIResponse(decision, type);

        await typeWriterEffect(reply);
        
        setButtonsState(false);
        isTyping = false;
    }

    btnSavage.addEventListener('click', () => handleAction('savage'));
    btnLogical.addEventListener('click', () => handleAction('logical'));
    btnExistential.addEventListener('click', () => handleAction('existential'));
    
    // Allow enter key to trigger default (savage) response
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAction('savage');
        }
    });
    
    // Example chips logic
    const exampleChips = document.querySelectorAll('.example-chip');
    exampleChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Strip quotes if they exist
            const text = chip.textContent.replace(/^"|"$/g, '');
            inputField.value = text;
            handleAction('savage'); // Defaulting to savage for quick examples
        });
    });
});
