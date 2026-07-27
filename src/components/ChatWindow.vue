<script setup lang="ts">
import { ref } from 'vue';
import Chat from './Chat.vue';
import ChatToggle from './ChatToggle.vue';

const isOpen = ref(false);

function toggleChat() {
  isOpen.value = !isOpen.value;
}
</script>


<template>

  <div class="tt-chat-window-wrapper">

    <transition name="tt-chat-window-transition">

      <div 
        v-if="isOpen" 
        class="tt-chat-window"
      >
        <Chat />
      </div>

    </transition>


    <ChatToggle 
      :isOpen="isOpen"
      @toggle="toggleChat"
    />

  </div>

</template>


<style lang="scss">

.tt-chat-window-wrapper {

  position: fixed;

  right: var(--tt-chat-window-right, var(--tt-chat-spacing));
  bottom: var(--tt-chat-window-bottom, var(--tt-chat-spacing));

  z-index: var(--tt-chat-window-z-index);

  display: flex;
  flex-direction: column;
  align-items: flex-end;

}


.tt-chat-window {

  width: var(--tt-chat-window-width);
  height: var(--tt-chat-window-height);

  background:white;

  border-radius:10px;

  box-shadow:
    0 5px 25px rgba(0,0,0,0.2);

  overflow:hidden;

}


@media (max-width:600px){

.tt-chat-window-wrapper{

right:10px;
bottom:10px;

}


.tt-chat-window{

width:calc(100vw - 20px);
height:calc(100vh - 120px);

}

}


</style>
