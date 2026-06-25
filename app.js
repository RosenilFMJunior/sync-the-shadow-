let motionThreshold = 0.5; // Sensibilidade do movimento
let stillnessTimer = null;
let secondsStill = 0;
const lens = document.getElementById('argos-lens');
const statusText = document.querySelector('.status-text');
const timerDisplay = document.getElementById('timer');
const manifesto = document.getElementById('manifesto');

// Solicita permissão para sensores em dispositivos iOS modernos, se necessário
function initSensors() {
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response == 'granted') {
                    window.addEventListener('devicemotion', handleMotion);
                }
            })
            .catch(console.error);
    } else {
        // Dispositivos Android ou Desktops (Simulação via mouse)
        window.addEventListener('devicemotion', handleMotion);
        window.addEventListener('mousemove', handleMouseReset);
    }
}

function handleMotion(event) {
    const acc = event.accelerationIncludingGravity;
    if (!acc) return;

    // Calcula a magnitude do vetor de movimento
    let movement = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    
    // Filtra a gravidade base para focar na mudança brusca (atrito)
    // Se houver movimento acima do limiar, reseta o Vazio
    if (Math.abs(movement - 9.8) > motionThreshold) {
        resetStillness();
    } else {
        startStillness();
    }
}

let mouseTimeout;
function handleMouseReset() {
    resetStillness();
    clearTimeout(mouseTimeout);
    mouseTimeout = setTimeout(startStillness, 500);
}

function startStillness() {
    if (!stillnessTimer) {
        statusText.innerText = "Paralisia detectada. Sincronizando com a sombra...";
        timerDisplay.classList.add('visible');
        stillnessTimer = setInterval(() => {
            secondsStill++;
            updateTimerDisplay();
            
            // Estágio 1 de imobilidade (5 segundos) - Ativa a Lente de Argos
            if (secondsStill >= 5) {
                lens.className = "lens-active";
            }
            
            // Estágio 2 de imobilidade (12 segundos) - Revela o Manifesto do Vazio
            if (secondsStill >= 12) {
                manifesto.className = "visible";
                statusText.innerText = "[ESTADO ARGOS: VIGILÂNCIA TOTAL]";
            }
        }, 1000);
    }
}

function resetStillness() {
    clearInterval(stillnessTimer);
    stillnessTimer = null;
    secondsStill = 0;
    lens.className = "lens-idle";
    manifesto.className = "hidden";
    timerDisplay.className = "hidden";
    statusText.innerText = "Ruído detectado. Estabilize o dispositivo para iniciar o SYNC.";
}

function updateTimerDisplay() {
    let mins = Math.floor(secondsStill / 60).toString().padStart(2, '0');
    let secs = (secondsStill % 60).toString().padStart(2, '0');
    timerDisplay.innerText = `${mins}:${secs}`;
}

// Inicia ao clicar na tela (exigência de segurança dos navegadores para áudio/sensores)
window.addEventListener('click', () => {
    initSensors();
    statusText.innerText = "Sensores acoplados. Mantenha a imobilidade.";
});
