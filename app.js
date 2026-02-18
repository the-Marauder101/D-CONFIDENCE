const chatEl = document.getElementById('chat');
const composer = document.getElementById('composer');
const messageEl = document.getElementById('message');
const modelEl = document.getElementById('model');

const sleepEl = document.getElementById('sleep');
const stressEl = document.getElementById('stress');
const confidenceEl = document.getElementById('confidence');
const focusEl = document.getElementById('focus');

const state = {
  messages: [
    {
      role: 'assistant',
      content:
        "Hi. I'm here to listen carefully and help you break emotions into clear thoughts and next steps. You are allowed to feel overwhelmed, and we can still move forward one step at a time.",
    },
  ],
};

function render() {
  chatEl.innerHTML = '';
  for (const message of state.messages) {
    const div = document.createElement('div');
    div.className = `msg ${message.role}`;
    div.textContent = message.content;
    chatEl.appendChild(div);
  }
  chatEl.scrollTop = chatEl.scrollHeight;
}

function getCheckin() {
  return {
    sleep: Number(sleepEl.value || 5),
    stress: Number(stressEl.value || 5),
    confidence: Number(confidenceEl.value || 5),
    focus: Number(focusEl.value || 5),
  };
}

async function chatWithOllama(messages, model) {
  const checkin = getCheckin();

  const systemPrompt = `
You are a supportive reflective coach for a woman rebuilding confidence after family conflict and career delay.

Goals:
1) Validate struggle without giving empty reassurance.
2) Identify likely patterns: shame, comparison, perfectionism, all-or-nothing thinking, fear of being behind.
3) Ask one focused follow-up question when needed.
4) End with 1-3 concrete actions for the next 24 hours.
5) Never say "no issue" if distress exists.
6) If signs of self-harm appear, urge immediate emergency help and trusted-person contact.

Current check-in:
- sleep: ${checkin.sleep}/10
- stress: ${checkin.stress}/10
- confidence: ${checkin.confidence}/10
- focus: ${checkin.focus}/10

Keep tone warm, respectful, and practical.
`; 

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      options: {
        temperature: 0.5,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.message?.content || 'I could not generate a response right now.';
}

composer.addEventListener('submit', async (event) => {
  event.preventDefault();

  const text = messageEl.value.trim();
  if (!text) {
    return;
  }

  state.messages.push({ role: 'user', content: text });
  render();
  messageEl.value = '';

  state.messages.push({ role: 'assistant', content: 'Thinking…' });
  render();

  try {
    const model = modelEl.value.trim() || 'llama3.1:8b';
    const reply = await chatWithOllama(
      state.messages.filter((m) => m.content !== 'Thinking…'),
      model
    );

    state.messages[state.messages.length - 1] = {
      role: 'assistant',
      content: reply,
    };
    render();
  } catch (error) {
    state.messages[state.messages.length - 1] = {
      role: 'assistant',
      content:
        'I could not connect to Ollama at http://localhost:11434. Please start Ollama and make sure the selected model is installed.',
    };
    render();
    console.error(error);
  }
});

render();
