<style lang="scss">
.tt-chat-window-wrapper {
  position: fixed;
  right: var(--tt-chat-window-right, var(--tt-chat-spacing));
  bottom: var(--tt-chat-window-bottom, var(--tt-chat-spacing));
  z-index: var(--tt-chat-window-z-index);

  display: flex;
  flex-direction: column;
  align-items: flex-end;

  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 40px);
}


.tt-chat-window {

  width: var(--tt-chat-window-width);
  height: var(--tt-chat-window-height);

  max-width: 100%;
  max-height: 100%;

  background: white;
  border-radius: 10px;

  box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);

  overflow: hidden;

}


/* Mobile fix */
@media (max-width: 600px) {

  .tt-chat-window-wrapper {

    position: fixed;

    left: 10px !important;
    right: 10px !important;
    bottom: 10px !important;

    width: calc(100vw - 20px);
    max-width: calc(100vw - 20px);

    height: auto;

    align-items: stretch;

  }


  .tt-chat-window {

    width: 100% !important;

    height: calc(100vh - 90px) !important;

    max-width: 100% !important;

    border-radius: 16px;

  }

}


/* Animation */
.tt-chat-window-transition-enter-active,
.tt-chat-window-transition-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}


.tt-chat-window-transition-enter-from,
.tt-chat-window-transition-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}

</style>
