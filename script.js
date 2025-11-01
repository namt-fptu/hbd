document.addEventListener("DOMContentLoaded", function () {
  const cake = document.querySelector(".cake");
  const candleCountDisplay = document.getElementById("candleCount");
  let candles = [];
  let audioContext;
  let analyser;
  let microphone;
  let audio = new Audio('hehe.mp3');
  let confettiInterval = null;

  function updateCandleCount() {
    const activeCandles = candles.filter(
      (candle) => !candle.classList.contains("out")
    ).length;
    candleCountDisplay.textContent = activeCandles;
    
    // Add visual feedback
    candleCountDisplay.style.transform = 'scale(1.2)';
    setTimeout(() => {
      candleCountDisplay.style.transform = 'scale(1)';
    }, 200);
  }

  function addCandle(left, top) {
    const candle = document.createElement("div");
    candle.className = "candle";
    candle.style.left = left + "px";
    candle.style.top = top + "px";

    const flame = document.createElement("div");
    flame.className = "flame";
    candle.appendChild(flame);

    cake.appendChild(candle);
    candles.push(candle);
    updateCandleCount();
    
    // Add entrance animation
    candle.style.animation = 'candleEntrance 0.5s ease-out';
  }

  cake.addEventListener("click", function (event) {
    const rect = cake.getBoundingClientRect();
    const left = event.clientX - rect.left;
    const top = event.clientY - rect.top;
    addCandle(left, top);
    
    // Visual feedback for click
    cake.style.transform = 'scale(1.1)';
    setTimeout(() => {
      cake.style.transform = 'scale(1)';
    }, 200);
  });

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    let average = sum / bufferLength;

    return average > 40; // Adjusted sensitivity for better UX
  }

  function blowOutCandles() {
    let blownOut = 0;

    // Only check for blowing if there are candles and at least one is not blown out
    if (candles.length > 0 && candles.some((candle) => !candle.classList.contains("out"))) {
      if (isBlowing()) {
        candles.forEach((candle) => {
          if (!candle.classList.contains("out") && Math.random() > 0.4) {
            candle.classList.add("out");
            blownOut++;
            
            // Add smoke effect
            createSmokeEffect(candle);
          }
        });
      }

      if (blownOut > 0) {
        updateCandleCount();
      }

      // If all candles are blown out, trigger confetti after a small delay
      if (candles.every((candle) => candle.classList.contains("out"))) {
        setTimeout(function() {
          triggerConfetti();
          endlessConfetti();
          showCelebrationMessage();
        }, 200);
        audio.play();
      }
    }
  }

  function createSmokeEffect(candle) {
    const smoke = document.createElement('div');
    smoke.style.position = 'absolute';
    smoke.style.left = candle.style.left;
    smoke.style.top = (parseInt(candle.style.top) - 30) + 'px';
    smoke.style.width = '3px';
    smoke.style.height = '20px';
    smoke.style.background = 'rgba(128, 128, 128, 0.5)';
    smoke.style.borderRadius = '50%';
    smoke.style.filter = 'blur(2px)';
    smoke.style.animation = 'smokeRise 1s ease-out forwards';
    smoke.style.pointerEvents = 'none';
    
    cake.appendChild(smoke);
    
    setTimeout(() => {
      smoke.remove();
    }, 1000);
  }

  function showCelebrationMessage() {
    const message = document.createElement('div');
    message.innerHTML = '🎊 Congratulations! 🎊';
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0);
      font-family: 'Pacifico', cursive;
      font-size: 3rem;
      color: white;
      text-shadow: 3px 3px 0 #ff6b9d, 6px 6px 0 #c44569;
      z-index: 1000;
      animation: popIn 0.5s ease-out 0.3s forwards;
      pointer-events: none;
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.style.animation = 'fadeOut 1s ease-out forwards';
      setTimeout(() => message.remove(), 1000);
    }, 3000);
  }

  // Add CSS animations dynamically
  const style = document.createElement('style');
  style.textContent = `
    @keyframes candleEntrance {
      from {
        transform: translateY(-20px) scale(0);
        opacity: 0;
      }
      to {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
    }
    
    @keyframes smokeRise {
      from {
        opacity: 0.6;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(-30px) scale(2);
      }
    }
    
    @keyframes popIn {
      to {
        transform: translate(-50%, -50%) scale(1);
      }
    }
    
    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: translate(-50%, -60%) scale(0.8);
      }
    }
  `;
  document.head.appendChild(style);



  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(function (stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        analyser.fftSize = 256;
        setInterval(blowOutCandles, 200);
        
        // Show success message for mic access
        showNotification('🎤 Microphone ready! You can now blow out candles!');
      })
      .catch(function (err) {
        console.log("Unable to access microphone: " + err);
        showNotification('⚠️ Please allow microphone access to blow out candles', 'error');
      });
  } else {
    console.log("getUserMedia not supported on your browser!");
    showNotification('⚠️ Your browser does not support microphone access', 'error');
  }
  
  function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? 'rgba(231, 76, 60, 0.95)' : 'rgba(46, 204, 113, 0.95)'};
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      font-weight: 600;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.5s ease-out;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.5s ease-out';
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
  
  // Add notification animations
  const notifStyle = document.createElement('style');
  notifStyle.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(notifStyle);
  
  // Add hover sound effect (optional - can be enabled)
  cake.addEventListener('mouseenter', function() {
    cake.style.cursor = 'pointer';
  });
  
  // Add visual indicator for microphone listening
  let micIndicator = document.createElement('div');
  micIndicator.className = 'mic-indicator';
  micIndicator.innerHTML = '🎤 Đang lắng nghe...';
  micIndicator.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 20px;
    background: rgba(46, 204, 113, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 600;
    font-size: 14px;
    z-index: 999;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    animation: pulse 1.5s ease-in-out infinite;
    display: none;
  `;
  document.body.appendChild(micIndicator);
  
  // Show mic indicator when microphone is active
  if (analyser) {
    micIndicator.style.display = 'block';
  }
  
  // Add keyboard shortcuts hint
  const keyboardHint = document.createElement('div');
  keyboardHint.innerHTML = '💡 Tip: Nhấn Space để test thổi nến!';
  keyboardHint.style.cssText = `
    position: fixed;
    bottom: 80px;
    left: 20px;
    background: rgba(155, 89, 182, 0.9);
    color: white;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 600;
    font-size: 14px;
    z-index: 999;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    animation: slideInLeft 1s ease-out 2s both;
  `;
  document.body.appendChild(keyboardHint);
  
  // Hide hint after 5 seconds
  setTimeout(() => {
    keyboardHint.style.animation = 'slideOut 0.5s ease-out forwards';
    keyboardHint.style.transform = 'translateX(-400px)';
  }, 7000);
  
  // Add keyboard shortcut for testing (Space key simulates blowing)
  document.addEventListener('keydown', function(e) {
    if (e.code === 'Space' && candles.length > 0) {
      e.preventDefault();
      // Simulate blowing effect
      candles.forEach((candle) => {
        if (!candle.classList.contains("out") && Math.random() > 0.6) {
          candle.classList.add("out");
          createSmokeEffect(candle);
        }
      });
      updateCandleCount();
      
      // Check if all blown out
      if (candles.every((candle) => candle.classList.contains("out"))) {
        setTimeout(function() {
          triggerConfetti();
          endlessConfetti();
          showCelebrationMessage();
          audio.play();
        }, 200);
      }
    }
  });
});

function triggerConfetti() {
  confetti({
    particleCount: 150,
    spread: 100,
    origin: { y: 0.6 },
    colors: ['#ff6b9d', '#c44569', '#ffeaa7', '#74b9ff', '#a29bfe']
  });
}

function endlessConfetti() {
  let count = 0;
  confettiInterval = setInterval(function() {
    confetti({
      particleCount: 100,
      spread: 120,
      origin: { x: Math.random(), y: 0 },
      colors: ['#ff6b9d', '#c44569', '#ffeaa7', '#74b9ff', '#a29bfe']
    });
    
    count++;
    if (count >= 10) {
      clearInterval(confettiInterval);
    }
  }, 500);
}
