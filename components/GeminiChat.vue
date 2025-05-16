<template>
  <div class="fixed bottom-6 left-6 z-50">
    <!-- Toggle Button with Gemini Logo -->
    <button
      @click="toggle"
      class="w-12 h-12 bg-white p-1 rounded-full overflow-hidden shadow-lg border border-[#fbc21b] hover:scale-105 transition-all"
    >
      <img
        src="/gemini-logo.png"
        alt="Chat"
        class="w-full h-full object-contain"
      />
    </button>

    <!-- Chat Popup -->
    <div
      v-if="isOpen"
      class="absolute bottom-20 left-0 w-80 bg-[#02061a] border border-[#fbc21b] rounded-lg shadow-lg overflow-hidden flex flex-col"
    >
      <div class="flex items-center bg-[#fbc21b] px-4 py-2 border-b border-[#fbc21b] relative">
        <img
          src="/gemini-logo.png"
          alt="Gemini"
          class="w-10 h-10 object-contain absolute left-4"
        />
        <span class="w-full text-center text-[#02061a] font-bold text-lg">Gemini</span>
      </div>

      <div class="flex-1 p-3 text-sm space-y-2 overflow-y-auto max-h-64 bg-[#02061a]">
        <div v-for="(msg, i) in messages" :key="i">
          <span
            :class="msg.startsWith('👤')
              ? 'text-[#fbc21b]'
              : 'text-white'"
          >
            {{ msg }}
          </span>
        </div>
      </div>

      <div class="flex gap-2 border-t border-[#fbc21b] p-3 bg-[#02061a]">
        <input
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="Type a message..."
          class="flex-1 border border-[#fbc21b] bg-[#02061a] px-3 py-2 rounded text-[#fbc21b] placeholder-[#fbc21b] text-sm focus:outline-none"
        />
        <button
          @click="sendMessage"
          class="bg-[#fbc21b] hover:bg-[#ffd966] text-[#02061a] px-3 py-2 rounded text-sm font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isOpen = ref(false)
const input = ref('')
const messages = ref<string[]>([])
const userMessageCount = ref(0)

const toggle = () => {
  isOpen.value = !isOpen.value
  if (isOpen.value && messages.value.length === 0) {
    messages.value.push('🤖: Am Gemini! Pls leave feedback!')
  }
}

const sendMessage = async () => {
  const message = input.value.trim()
  if (!message) return

  messages.value.push(`👤: ${message}`)
  userMessageCount.value++
  input.value = ''

  // Goodbye detection
  if (/bye|see ya|goodbye/i.test(message)) {
    messages.value.push('🤖: Thanks for visiting! Talk to you again soon 💛')
    return
  }

  // Ask for feedback after 3 messages
  if (userMessageCount.value === 3) {
    messages.value.push('🤖: By the way, I’d love to hear your feedback on the site so far!')
  }

  // Step 1: Ask Gemini if this message is feedback
  const classifyPrompt = `Determine if the following message is intended as user feedback or a casual chat. Reply with only "yes" or "no".

Message:
"${message}"`
  const classifyRes = await $fetch('/api/gemini', {
    method: 'POST',
    body: { prompt: classifyPrompt }
  })

  const classification = (classifyRes && 'response' in classifyRes && typeof classifyRes.response === 'string')
    ? classifyRes.response.toLowerCase().trim()
    : undefined

  if (classification === 'yes') {
    try {
      await $fetch('https://formsubmit.co/blob@mooshieblob.com', {
        method: 'POST',
        body: {
          _captcha: false,
          _honey: '',
          _next: 'https://mooshieblob.com/thank-you',
          message
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
      messages.value.push('🤖: Thank you! I’ve sent your feedback to the team 💌')
    } catch {
      messages.value.push('🤖: I couldn’t send your feedback. Please try again later.')
    }
    return
  }

  // Step 2: Otherwise, ask Gemini to respond normally
  const { data, error } = await useFetch('/api/gemini', {
    method: 'POST',
    body: { prompt: message }
  })

  if (data.value && 'response' in data.value) {
    messages.value.push(`🤖: ${data.value.response}`)
  } else {
    messages.value.push('🤖: Hmm, something went wrong. Try again?')
  }
}
</script>
