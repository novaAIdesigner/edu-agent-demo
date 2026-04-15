export class CoverPage {
  private panel: HTMLElement;

  constructor() {
    this.panel = document.createElement('div');
    this.panel.className = 'overflow-y-auto';
  }

  getPanel(): HTMLElement {
    return this.panel;
  }

  render(): void {
    this.panel.innerHTML = `
      <!-- Hero Section -->
      <section class="hero-gradient relative overflow-hidden">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div class="relative mx-auto max-w-screen-xl px-6 py-20 text-center">
          <div class="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-blue-200 backdrop-blur-sm ring-1 ring-white/20">
            <img src="/ai-foundry.png" alt="Azure AI Foundry" class="h-5 w-5" />
            Powered by Microsoft Azure AI Foundry
          </div>
          <h1 class="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Real-Time AI Language<br/>Education Agent
          </h1>
          <p class="mx-auto mt-4 max-w-2xl text-xl font-medium text-blue-100/90">
            Speak. Practice. Improve &mdash; Instantly.
          </p>
          <p class="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-blue-100/70">
            Experience a new generation of AI language learning. This demo showcases a real-time conversational education agent powered by Microsoft Azure Speech and agent orchestration technologies. It combines natural conversation with expert-level pronunciation assessment, enabling learners to improve <em>how</em> they speak &mdash; not just <em>what</em> they say.
          </p>
          <div class="mt-10 flex items-center justify-center gap-4">
            <button id="cover-start-demo" class="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-gray-900 shadow-lg hover:bg-gray-100 transition-all hover:scale-105">
              <svg class="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z"/></svg>
              Start the Demo
            </button>
            <a href="#benchmarks" class="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 transition-all">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM10 7a1.5 1.5 0 0 0-3 0v9.5a1.5 1.5 0 0 0 3 0V7ZM5.5 12A1.5 1.5 0 0 0 4 13.5v3a1.5 1.5 0 0 0 3 0v-3A1.5 1.5 0 0 0 5.5 12Z"/></svg>
              View Benchmarks
            </a>
          </div>
        </div>
      </section>

      <div class="mx-auto max-w-screen-xl px-6">

        <!-- What Makes This Different -->
        <section class="py-16">
          <div class="text-center mb-12">
            <h2 class="text-2xl font-bold text-white sm:text-3xl">What Makes This Education Agent Different?</h2>
            <p class="mt-3 text-sm text-gray-400 max-w-2xl mx-auto">Most language learning solutions focus on either conversation <em>or</em> pronunciation scoring. This agent delivers both &mdash; in one seamless experience.</p>
          </div>
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            ${this.featureCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"/>`,
              'Real-Time Conversation',
              'Engage in natural, spoken dialogue across structured drills, exam simulations, and free conversation scenarios.',
              'blue'
            )}
            ${this.featureCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>`,
              'Expert-Level Pronunciation',
              'Receive word- and phoneme-level pronunciation scores, aligned with human expert evaluation standards (~0.75 correlation).',
              'emerald'
            )}
            ${this.featureCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"/>`,
              'Multi-Language by Design',
              'Supports 40+ languages, enabling bilingual tutoring and global deployment.',
              'violet'
            )}
            ${this.featureCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.745 3.745 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"/>`,
              'Learn Without Breaking Flow',
              'Powered by a "talk first, correct after" design &mdash; feedback is accurate, timely, and confidence-preserving.',
              'amber'
            )}
          </div>
        </section>

        <!-- Demo Scenarios -->
        <section class="py-16 border-t border-gray-800">
          <div class="text-center mb-12">
            <h2 class="text-2xl font-bold text-white sm:text-3xl">Demo Scenarios Available</h2>
            <p class="mt-3 text-sm text-gray-400 max-w-2xl mx-auto">Choose a scenario to experience how the Education Agent adapts to different learning needs.</p>
          </div>
          <div class="grid gap-5 sm:grid-cols-2">
            ${this.scenarioCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/>`,
              'Bilingual AI Tutor',
              'Practice a foreign language while receiving explanations in your native language &mdash; ideal for beginners and classroom learning.',
              'bilingual-tutor',
              'blue'
            )}
            ${this.scenarioCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"/>`,
              'Pattern Drill Practice (FSI-Style)',
              'Strengthen fluency and sentence reflexes through structured repetition with instant pronunciation scoring.',
              'fsi-drill',
              'cyan'
            )}
            ${this.scenarioCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>`,
              'Exam Simulation (IELTS Speaking)',
              'Simulated speaking tasks with post-session feedback on pronunciation, fluency, and clarity.',
              'ielts-sim',
              'amber'
            )}
            ${this.scenarioCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"/>`,
              'Free Conversation with Smart Correction',
              'Open-ended dialogue where pronunciation issues are detected quietly and summarized at natural breakpoints.',
              'free-conversation',
              'emerald'
            )}
          </div>
        </section>

        <!-- How It Works -->
        <section class="py-16 border-t border-gray-800">
          <div class="text-center mb-12">
            <h2 class="text-2xl font-bold text-white sm:text-3xl">How It Works (Under the Hood)</h2>
            <p class="mt-3 text-sm text-gray-400 max-w-2xl mx-auto">This demo is built on three mature Azure components.</p>
          </div>
          <div class="grid gap-5 lg:grid-cols-3">
            ${this.techCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"/>`,
              'Azure Pronunciation Assessment',
              'High-precision pronunciation scoring from article to sentence to word to phoneme level.',
              'emerald'
            )}
            ${this.techCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"/>`,
              'Azure Voice Live API',
              'Low-latency, speech-to-speech interaction with noise suppression and streaming audio processing.',
              'blue'
            )}
            ${this.techCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"/>`,
              'Azure AI Foundry Agent',
              'Orchestrates conversation logic, tool calls, scoring aggregation, and feedback delivery.',
              'violet'
            )}
          </div>
          <p class="mt-8 text-center text-sm text-gray-500 max-w-3xl mx-auto">Together, they create an end-to-end real-time speaking tutor &mdash; without requiring customers to build complex speech pipelines from scratch.</p>
        </section>

        <!-- Who Is This For -->
        <section class="py-16 border-t border-gray-800">
          <div class="text-center mb-12">
            <h2 class="text-2xl font-bold text-white sm:text-3xl">Who Is This For?</h2>
          </div>
          <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            ${this.audienceCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"/>`,
              'EdTech Platforms',
              'Adding speaking practice at scale'
            )}
            ${this.audienceCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21"/>`,
              'Language Training Centers',
              'Extending learning beyond classrooms'
            )}
            ${this.audienceCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"/>`,
              'Test Preparation Providers',
              'Automating speaking evaluation'
            )}
            ${this.audienceCard(
              `<path stroke-linecap="round" stroke-linejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0"/>`,
              'Corporate Training Teams',
              'Improving global communication skills'
            )}
          </div>
          <p class="mt-8 text-center text-xs text-gray-500">The architecture supports cloud-hosted APIs and customer-owned Azure deployments for data residency needs.</p>
        </section>

        <!-- CTA -->
        <section class="py-16 border-t border-gray-800">
          <div class="rounded-2xl border border-gray-800 bg-gray-900/50 p-10 text-center">
            <h2 class="text-2xl font-bold text-white mb-4">Start the Demo</h2>
            <div class="flex items-center justify-center gap-8 text-sm text-gray-400 mb-8">
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4Z"/><path d="M5.5 9.643a.75.75 0 0 0-1.5 0V10c0 3.06 2.29 5.585 5.25 5.954V17.5h-1.5a.75.75 0 0 0 0 1.5h4.5a.75.75 0 0 0 0-1.5h-1.5v-1.546A6.001 6.001 0 0 0 16 10v-.357a.75.75 0 0 0-1.5 0V10a4.5 4.5 0 0 1-9 0v-.357Z"/></svg>
                Allow microphone access
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd"/></svg>
                Choose a learning scenario
              </div>
              <div class="flex items-center gap-2">
                <svg class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor"><path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 15.5 2ZM10 7a1.5 1.5 0 0 0-3 0v9.5a1.5 1.5 0 0 0 3 0V7ZM5.5 12A1.5 1.5 0 0 0 4 13.5v3a1.5 1.5 0 0 0 3 0v-3A1.5 1.5 0 0 0 5.5 12Z"/></svg>
                Speak and see your pronunciation improve
              </div>
            </div>
            <p class="text-sm text-gray-500 max-w-2xl mx-auto mb-6">This demo illustrates how AI can move language learning from passive study to active, guided speaking practice &mdash; at scale.</p>
            <button id="cover-start-demo-2" class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-500 transition-all hover:scale-105">
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M6.3 2.84A1.5 1.5 0 0 0 4 4.11v11.78a1.5 1.5 0 0 0 2.3 1.27l9.344-5.891a1.5 1.5 0 0 0 0-2.538L6.3 2.841Z"/></svg>
              Launch a Scenario
            </button>
          </div>
        </section>

        <!-- Why This Matters -->
        <section class="py-12 mb-8 text-center">
          <h3 class="text-lg font-semibold text-white mb-3">Why This Matters</h3>
          <p class="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            The global language learning market is large, fast-growing, and fragmented &mdash; with no single dominant platform.
            This Education Agent demonstrates how real-time conversational AI + precise speech evaluation can unlock a new standard for language education.
          </p>
        </section>
      </div>
    `;

    // Wire up "Start Demo" buttons to navigate to first scenario tab
    this.panel.querySelectorAll('#cover-start-demo, #cover-start-demo-2').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.hash = 'bilingual-tutor';
      });
    });
  }

  private featureCard(iconPath: string, title: string, desc: string, color: string): string {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-400 bg-blue-500/10 ring-blue-500/20',
      emerald: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20',
      violet: 'text-violet-400 bg-violet-500/10 ring-violet-500/20',
      amber: 'text-amber-400 bg-amber-500/10 ring-amber-500/20',
    };
    return `
      <div class="glow-card rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <div class="mb-3 inline-flex rounded-lg p-2 ring-1 ${colorMap[color]}">
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${iconPath}</svg>
        </div>
        <h3 class="text-sm font-bold text-white mb-1.5">${title}</h3>
        <p class="text-xs text-gray-400 leading-relaxed">${desc}</p>
      </div>
    `;
  }

  private scenarioCard(iconPath: string, title: string, desc: string, tabId: string, color: string): string {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-400 bg-blue-500/10 ring-blue-500/20 hover:border-blue-500/40',
      cyan: 'text-cyan-400 bg-cyan-500/10 ring-cyan-500/20 hover:border-cyan-500/40',
      amber: 'text-amber-400 bg-amber-500/10 ring-amber-500/20 hover:border-amber-500/40',
      emerald: 'text-emerald-400 bg-emerald-500/10 ring-emerald-500/20 hover:border-emerald-500/40',
    };
    const [iconColor, bgColor, ringColor, hoverColor] = colorMap[color].split(' ');
    return `
      <a href="#${tabId}" class="glow-card group flex gap-4 rounded-xl border border-gray-800 bg-gray-900/60 p-5 transition-all ${hoverColor}">
        <div class="flex-shrink-0 inline-flex rounded-lg p-2.5 ring-1 ${iconColor} ${bgColor} ${ringColor}">
          <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${iconPath}</svg>
        </div>
        <div>
          <h3 class="text-sm font-bold text-white mb-1 group-hover:text-blue-300 transition-colors">${title}</h3>
          <p class="text-xs text-gray-400 leading-relaxed">${desc}</p>
        </div>
      </a>
    `;
  }

  private techCard(iconPath: string, title: string, desc: string, color: string): string {
    const colorMap: Record<string, string> = {
      emerald: 'from-emerald-500/20 to-emerald-500/5 text-emerald-400 border-emerald-500/30',
      blue: 'from-blue-500/20 to-blue-500/5 text-blue-400 border-blue-500/30',
      violet: 'from-violet-500/20 to-violet-500/5 text-violet-400 border-violet-500/30',
    };
    return `
      <div class="rounded-xl border ${colorMap[color].split(' ').pop()} bg-gradient-to-b ${colorMap[color].split(' ').slice(0, 2).join(' ')} p-6">
        <svg class="h-8 w-8 mb-3 ${colorMap[color].split(' ')[2]}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${iconPath}</svg>
        <h3 class="text-sm font-bold text-white mb-2">${title}</h3>
        <p class="text-xs text-gray-400 leading-relaxed">${desc}</p>
      </div>
    `;
  }

  private audienceCard(iconPath: string, title: string, desc: string): string {
    return `
      <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-5 text-center">
        <svg class="h-6 w-6 mx-auto mb-2 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">${iconPath}</svg>
        <h4 class="text-sm font-semibold text-white mb-1">${title}</h4>
        <p class="text-xs text-gray-500">${desc}</p>
      </div>
    `;
  }
}
