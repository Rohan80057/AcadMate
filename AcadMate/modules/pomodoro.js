window.loadPomodoro = function(container) {
  container.innerHTML = `
    <div class="pomodoro-modern fade-in">
      <h2>Pomodoro Timer</h2>
      <div class="pomodoro-setter-wrap">
        <div class="pomodoro-clock-outer">
          <div class="pomodoro-clock-hand" id="pomodoro-hand"></div>
          <div class="pomodoro-clock-knob" id="pomodoro-knob"></div>
          <div class="pomodoro-clock-inner" id="pomodoro-setter-txt">25:00</div>
        </div>
        <div style="margin-top: 12px; font-size: 1rem; color: var(--primary2);">
          <span id="pomodoro-setter-label">Set Timer: 25 min</span>
        </div>

        <!-- Hour/Minute Inputs -->
        <div class="pomodoro-time-controls">
          <input type="number" min="0" max="23" id="pomodoro-hour" value="0" aria-label="Hour input" /> h
          <input type="number" min="1" max="59" id="pomodoro-minute" value="25" aria-label="Minute input" /> m
          <button id="pomodoro-set-btn" aria-label="Set timer button">Set</button>
        </div>
      </div>
      <div class="pomodoro-controls-modern">
        <button id="pomodoro-start">Start</button>
        <button id="pomodoro-pause">Pause</button>
        <button id="pomodoro-reset">Reset</button>
      </div>
      <div class="pomodoro-modern-status" id="pomodoro-modern-status">Ready to focus!</div>
    </div>
  `;

  // State
  let timerLength = 25 * 60; // default 25 min in seconds
  let seconds = timerLength;
  let running = false;
  let timer = null;
  let isSetting = false;

  // DOM elements
  const hand = container.querySelector('#pomodoro-hand');
  const knob = container.querySelector('#pomodoro-knob');
  const setterTxt = container.querySelector('#pomodoro-setter-txt');
  const setterLabel = container.querySelector('#pomodoro-setter-label');
  const startBtn = container.querySelector('#pomodoro-start');
  const pauseBtn = container.querySelector('#pomodoro-pause');
  const resetBtn = container.querySelector('#pomodoro-reset');
  const statusDisplay = container.querySelector('#pomodoro-modern-status');
  const clockOuter = container.querySelector('.pomodoro-clock-outer');

  const hourInput = container.querySelector('#pomodoro-hour');
  const minuteInput = container.querySelector('#pomodoro-minute');
  const setBtn = container.querySelector('#pomodoro-set-btn');

  // Helper renders
  function updateSetterDisplay(secs) {
    const mins = Math.floor(secs / 60);
    const sec = secs % 60;
    setterTxt.textContent = `${String(mins).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    setterLabel.textContent = `Set Timer: ${mins} min${sec ? (' ' + sec + 's') : ''}`;

    // Keep inputs in sync
    hourInput.value = Math.floor(mins / 60) || 0;
    minuteInput.value = mins % 60 || 1;
  }
  function updateTimerDisplay() {
    updateSetterDisplay(seconds);
  }

  // Fluid rotary knob interaction
  function initializeKnob() {
    let dragging = false;
    let requestId = null;
    let latestPointerEvent = null;

    function updateRotationByEvent(e) {
      if (!dragging) return;
      const rect = clockOuter.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let clientX, clientY;
      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      latestPointerEvent = { clientX, clientY, cx, cy };
      if (!requestId) requestId = requestAnimationFrame(animateRotation);
    }

    function animateRotation() {
      if (!latestPointerEvent) {
        requestId = null;
        return;
      }
      const { clientX, clientY, cx, cy } = latestPointerEvent;
      latestPointerEvent = null;
      let angle = (Math.atan2(clientX - cx, cy - clientY) * 180 / Math.PI + 360) % 360;
      // Fluidly map 0-360deg to 0-60min, limit minimum 1 min (= 6deg)
      const minSeconds = 60;
      timerLength = Math.round(Math.max(angle * (60 / 360) * 60, minSeconds));
      seconds = timerLength;
      hand.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
      knob.style.transform = `translate(-50%,0) rotate(${angle}deg)`;
      updateSetterDisplay(seconds);
      isSetting = true;
      requestId = null;
      statusDisplay.textContent = 'Set your session duration.';
    }

    knob.addEventListener('mousedown', e => {
      dragging = true;
      document.body.style.cursor = "grabbing";
      e.preventDefault();
    });
    clockOuter.addEventListener('mousemove', e => { if (dragging) updateRotationByEvent(e); });
    document.addEventListener('mouseup', () => {
      dragging = false;
      document.body.style.cursor = "";
      isSetting = false;
      if (requestId) cancelAnimationFrame(requestId);
      requestId = null;
    });

    knob.addEventListener('touchstart', e => {
      dragging = true;
      document.body.style.cursor = "grabbing";
      e.preventDefault();
    }, { passive: false });
    clockOuter.addEventListener('touchmove', e => { if (dragging) updateRotationByEvent(e); }, { passive: false });
    document.addEventListener('touchend', () => {
      dragging = false;
      document.body.style.cursor = "";
      isSetting = false;
      if (requestId) cancelAnimationFrame(requestId);
      requestId = null;
    });

    // Clicking on clock face sets timer quickly
    clockOuter.addEventListener('click', e => {
      if (dragging) return;
      const rect = clockOuter.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let clientX = e.clientX;
      let clientY = e.clientY;
      let angle = (Math.atan2(clientX - cx, cy - clientY) * 180 / Math.PI + 360) % 360;
      const minSeconds = 60;
      timerLength = Math.round(Math.max(angle * (60 / 360) * 60, minSeconds));
      seconds = timerLength;
      hand.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
      knob.style.transform = `translate(-50%,0) rotate(${angle}deg)`;
      updateSetterDisplay(seconds);
      statusDisplay.textContent = 'Set your session duration.';
    });

    // Initialize to 25 min position
    const defaultAngle = (25 / 60) * 360;
    setHandAndValue(defaultAngle, false);

    function setHandAndValue(angle, notify = true) {
      const minSeconds = 60;
      timerLength = Math.round(Math.max(angle * (60 / 360) * 60, minSeconds));
      seconds = timerLength;
      hand.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
      knob.style.transform = `translate(-50%,0) rotate(${angle}deg)`;
      updateSetterDisplay(timerLength);
      if (notify) statusDisplay.textContent = 'Set your session duration.';
    }
  }

  initializeKnob();

  // Set timer using inputs
  setBtn.onclick = () => {
    let hr = parseInt(hourInput.value, 10) || 0;
    let min = parseInt(minuteInput.value, 10) || 0;
    let totalMins = hr * 60 + min;
    if (totalMins < 1) totalMins = 1;       // Minimum 1 minute
    if (totalMins > 60) totalMins = 60;     // Maximum 60 minutes to keep consistent with rotary
    timerLength = seconds = totalMins * 60;
    const angle = (totalMins / 60) * 360;
    hand.style.transform = `translate(-50%, -100%) rotate(${angle}deg)`;
    knob.style.transform = `translate(-50%,0) rotate(${angle}deg)`;
    updateSetterDisplay(seconds);
    statusDisplay.textContent = "Session time updated.";
  };

  // Timer control functions
  function startTimer() {
    if (running) return;
    if (seconds <= 0) seconds = timerLength;
    running = true;
    statusDisplay.textContent = 'Stay focused!';
    hand.style.filter = "brightness(1.08) drop-shadow(0 0 7px var(--primary2))";
    knob.style.borderColor = "var(--primary2)";
    timer = setInterval(() => {
      if (seconds > 0) {
        seconds--;
        updateTimerDisplay();
      } else {
        clearInterval(timer);
        running = false;
        hand.style.filter = "";
        knob.style.borderColor = "var(--primary)";
        statusDisplay.textContent = "Session Complete! 🎉";
      }
    }, 1000);
  }
  function pauseTimer() {
    running = false;
    clearInterval(timer);
    statusDisplay.textContent = "Paused";
    hand.style.filter = "";
    knob.style.borderColor = "var(--primary)";
  }
  function resetTimer() {
    running = false;
    clearInterval(timer);
    seconds = timerLength;
    updateTimerDisplay();
    statusDisplay.textContent = "Ready to focus!";
    hand.style.filter = "";
    knob.style.borderColor = "var(--primary)";
  }

  startBtn.onclick = startTimer;
  pauseBtn.onclick = pauseTimer;
  resetBtn.onclick = resetTimer;
};
