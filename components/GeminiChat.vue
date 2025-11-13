<template>
  <div class="fixed bottom-6 left-6 z-50">
    <!-- Toggle Button with Gemini Logo -->
    <button
      @click="toggle"
      aria-label="Open chat with Gemini assistant"
      :aria-expanded="isOpen"
      aria-controls="chat-popup"
      class="w-12 h-12 bg-white p-1 rounded-full overflow-hidden shadow-lg border border-[#fbc21b] hover:scale-105 transition-all"
    >
      <img
        src="/gemini-logo.png"
        alt=""
        aria-hidden="true"
        class="w-full h-full object-contain"
      />
    </button>

    <!-- Chat Popup -->
    <div
      v-if="isOpen"
      id="chat-popup"
      role="dialog"
      aria-label="Chat with Gemini assistant"
      aria-modal="false"
      @keydown="handleKeyDown"
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

      <!-- Chat messages -->
      <div 
        class="flex-1 p-3 text-sm space-y-2 overflow-y-auto max-h-64 bg-[#02061a]"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
      >
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="flex items-start gap-2"
        >
          <template v-if="msg.startsWith('👤')">
            <span class="text-[#fbc21b]">👤</span>
            <span class="text-[#fbc21b]">{{ msg.slice(3) }}</span>
          </template>
          <template v-else>
            <img src="/blobbot.webp" alt="BlobBot" class="w-6 h-6 rounded-full" />
            <span class="text-white">{{ msg.slice(3) }}</span>
          </template>
        </div>
      </div>

      <!-- Input -->
      <div class="flex gap-2 border-t border-[#fbc21b] p-3 bg-[#02061a]">
        <label for="chat-input" class="sr-only">Type your message</label>
        <input
          id="chat-input"
          ref="chatInput"
          v-model="input"
          @keyup.enter="sendMessage"
          placeholder="type a message..."
          aria-label="Chat message input"
          class="flex-1 border border-[#fbc21b] bg-[#02061a] px-3 py-2 rounded text-[#fbc21b] placeholder-[#fbc21b] text-sm focus:outline-none"
        />
        <button
          @click="sendMessage"
          aria-label="Send message"
          :disabled="!input.trim()"
          class="bg-[#fbc21b] hover:bg-[#ffd966] text-[#02061a] px-3 py-2 rounded text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          send
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'

const isOpen = ref(false)
const input = ref('')
const messages = ref<string[]>([])
const userMessageCount = ref(0)
const chatInput = ref<HTMLInputElement | null>(null)

const toggle = async () => {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    if (messages.value.length === 0) {
      messages.value.push('ya, am geminiblob! pls leave feedback! 💛')
    }
    // Focus input when opening
    await nextTick()
    chatInput.value?.focus()
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  // Close on Escape key
  if (event.key === 'Escape') {
    isOpen.value = false
  }
}

const sendMessage = async () => {
  const message = input.value.trim()
  if (!message) return

  messages.value.push(`👤: ${message}`)
  userMessageCount.value++
  input.value = ''

  if (/bye|see ya|goodbye/i.test(message)) {
    messages.value.push(`ya, see ya fren! take care 💛`)
    return
  }

  if (userMessageCount.value === 3) {
    messages.value.push(`btw, u can leave feedback any time ya! i pass it on 🐾`)
  }

  // Classify if it's feedback
  const classifyPrompt = `is this user message feedback? say only "yes" or "no"\n\n"${message}"`
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
      messages.value.push(`ya, got it! i sent ur feedback 💌`)
    } catch {
      messages.value.push(`o nooo, i couldn't send da feedback 😢 try again later ya`)
    }
    return
  }

  // Else, send to Gemini for normal response
  const { data, error } = await useFetch('/api/gemini', {
    method: 'POST',
    body: { prompt: message }
  })

  if (data.value && 'response' in data.value) {
    messages.value.push(`geminiblob: ${data.value.response}`)
  } else {
    messages.value.push(`geminiblob: oopsie, something broke 😿 try again in a sec ya`)
  }
}
</script>
