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

  max-width: calc(100vw - 40px);
  max-height: calc(100vh - 100px);

  background:white;

  border-radius:10px;

  box-shadow:
    0 5px 25px rgba(0,0,0,0.2);

  overflow:hidden;

  margin-bottom:20px;

}



/* MOBILE */

@media (max-width:600px) {


  .tt-chat-window-wrapper {

    right:10px;
    bottom:10px;

    max-width:calc(100vw - 20px);

  }


  .tt-chat-window {

    width:calc(100vw - 20px);

    height:calc(100vh - 120px);

    border-radius:16px;

  }

}
