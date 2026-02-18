const chatEl = document.getElementById('chat');
const composer = document.getElementById('composer');
const messageEl = document.getElementById('message');
const modelEl = document.getElementById('model');

const sleepEl = document.getElementById('sleep');
const stressEl = document.getElementById('stress');
const confidenceEl = document.getElementById('confidence');
const focusEl = document.getElementById('focus');

const promptPlanBtn = document.getElementById('prompt-plan');
const promptRevisionBtn = document.getElementById('prompt-revision');
const showResourcesBtn = document.getElementById('show-resources');

const state = {
  messages: [
    {
      role: 'assistant',
      content:
        "Hi, I'm Dcon. I'll support both emotional resilience and CA exam preparation. We will stay practical: understand what you're feeling, then convert it into small wins.",
    },
  ],
  resources: null,
};

async function loadResources() {
  const response = await fetch('data/ca_india_resources_2026.json');
  if (!response.ok) throw new Error('Could not load local CA resources file');
  state.resources = await response.json();
}

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

function buildKnowledgeSnippet() {
  if (!state.resources) return 'No CA resources loaded.';
  return state.resources.resources
    .map((item) => `${item.id}: ${item.title} | ${item.url} | ${item.purpose}`)
    .join('\n');
}

async function chatWithOllama(messages, model) {
  const checkin = getCheckin();
  const knowledge = buildKnowledgeSnippet();

  const systemPrompt = `
You are Dcon, a dual-purpose assistant:
A) emotional reflection coach for confidence rebuilding,
B) CA-India preparation copilot.

Rules:
1) Always validate distress with respect; never dismiss the problem.
2) For study help, prioritize verified local knowledge base references provided below.
3) Never invent ICAI rules, dates, exemptions, or procedures.
4) If unsure, explicitly say uncertainty and ask the user to verify on official portals.
5) When using resources, cite resource IDs in brackets, e.g. [ICAI_EXAM_PORTAL].
6) For planning, give actionable output: timetable blocks, revision sequence, and today's top 3 tasks.
7) If signs of self-harm appear, advise immediate emergency support + trusted person.

Current check-in:
- sleep: ${checkin.sleep}/10
- stress: ${checkin.stress}/10
- confidence: ${checkin.confidence}/10
- focus: ${checkin.focus}/10

Verified CA knowledge base entries:
${knowledge}
`;

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      options: { temperature: 0.4 },
    }),
  });

  if (!response.ok) throw new Error(`Ollama error: ${response.status}`);
  const data = await response.json();
  return data.message?.content || 'I could not generate a response right now.';
}

function addUserPrompt(text) {
  messageEl.value = text;
  messageEl.focus();
}

promptPlanBtn.addEventListener('click', () => {
  addUserPrompt('Build me a 7-day CA study timetable that is realistic with stress recovery and confidence rebuilding.');
});

promptRevisionBtn.addEventListener('click', () => {
  addUserPrompt('Create a quick revision sheet format for today: topics, formulas/sections, expected mistakes, and 30-minute revision loops.');
});

showResourcesBtn.addEventListener('click', () => {
  if (!state.resources) return;
  const intro = {
    role: 'assistant',
    content:
      'Here are the verified CA references currently loaded in Dcon (stored locally in this repo):\n' +
      state.resources.resources
        .map((item) => `- [${item.id}] ${item.title} — ${item.url}`)
        .join('\n'),
  };
  state.messages.push(intro);
  render();
});

composer.addEventListener('submit', async (event) => {
  event.preventDefault();

  const text = messageEl.value.trim();
  if (!text) return;

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

    state.messages[state.messages.length - 1] = { role: 'assistant', content: reply };
    render();
  } catch (error) {
    state.messages[state.messages.length - 1] = {
      role: 'assistant',
      content:
        'I could not connect to Ollama at http://localhost:11434. Start Ollama and ensure the model is installed (default: llama3.1:8b).',
    };
    render();
    console.error(error);
  }
});

loadResources()
  .then(() => render())
  .catch(() => {
    state.messages.push({
      role: 'assistant',
      content: 'Warning: local CA resource file could not be loaded. Study answers will be limited.',
    });
    render();
  });
