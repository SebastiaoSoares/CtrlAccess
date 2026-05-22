let currentSession = null;
let ua = null;

const initSIP = () => {
    const JsSIP = window.JsSIP;
    
    if (!JsSIP) {
        setTimeout(initSIP, 1000); 
        return;
    }

    const socket = new JsSIP.WebSocketInterface('wss://192.168.0.62:8089/ws');
    const configuration = {
        sockets: [socket],
        uri: 'sip:1001@192.168.0.62',
        password: 'senha123'
    };

    ua = new JsSIP.UA(configuration);
    ua.start();
};

initSIP();

export const pullParkedCall = () => {
    makeDirectSipCall('8888');
};

export const makeDirectSipCall = (target) => {
    const usarPrefixo = target.includes('.');
    const uri = `sip:${usarPrefixo ? 'c' : ''}${target}@192.168.0.62`;
    
    const options = {
        mediaConstraints: { audio: true, video: false },
        pcConfig: { 
            rtcpMuxPolicy: 'require',
            iceServers: []
        },
        rtcOfferConstraints: { offerToReceiveAudio: true },
        sessionTimersExpires: 120,
        extraHeaders: ['X-Can-Renegotiate: False']
    };
    
    const session = ua.call(uri, options);

    session.on('confirmed', () => {
        currentSession = session;
    });

    session.on('ended', () => {
        currentSession = null;
        fecharModalChamadaAtiva();
    });

    session.on('failed', () => {
        currentSession = null;
        fecharModalChamadaAtiva();
    });

    session.on('peerconnection', (e) => {
        try {
            const senders = e.peerconnection.getSenders();
            senders.forEach(sender => {
                if (sender.track && sender.track.kind === 'audio') {
                    const parameters = sender.getParameters();
                    if (parameters && parameters.codecs) {
                        parameters.codecs = parameters.codecs.filter(c => c.mimeType === 'audio/PCMU' || c.mimeType === 'audio/telephone-event');
                        sender.setParameters(parameters).catch(() => {});
                    }
                }
            });
        } catch (err) {}

        e.peerconnection.addEventListener('track', (event) => {
            let audioRemoto = document.getElementById('remote-audio');
            
            if (!audioRemoto) {
                audioRemoto = document.createElement('audio');
                audioRemoto.id = 'remote-audio';
                audioRemoto.autoplay = true;
                document.body.appendChild(audioRemoto);
            }
            
            audioRemoto.muted = false;
            audioRemoto.volume = 1.0; 
            
            if (audioRemoto.srcObject !== event.streams[0]) {
                audioRemoto.srcObject = event.streams[0];
                audioRemoto.play().catch(() => {});
            }
        });
    });
};

export function criarModalChamada(data) {
    const overlay = document.createElement('div');
    overlay.id = 'sip-modal-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.75); display: flex;
        align-items: center; justify-content: center; z-index: 9999;
        backdrop-filter: blur(4px); font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: #ffffff; padding: 30px; border-radius: 12px;
        box-shadow: 0 15px 30px rgba(0,0,0,0.5); text-align: center;
        max-width: 400px; width: 90%; animation: modalPopIn 0.3s ease-out;
    `;

    modal.innerHTML = `
        <div style="font-size: 50px; margin-bottom: 10px; animation: pulseRing 1.5s infinite;">🚨</div>
        <h2 style="margin: 0 0 10px; color: #d32f2f; font-size: 24px; font-weight: bold;">Chamada na Portaria</h2>
        <p style="margin: 0 0 25px; color: #555; font-size: 16px; line-height: 1.5;">
            Origem: <strong style="color: #222; font-size: 18px;">${data.nome || 'Dispositivo'}</strong><br>
            <small style="color: #888;">IP: ${data.ip || '---'}</small>
        </p>
        <div style="display: flex; gap: 15px; justify-content: center;">
            <button id="btn-rejeitar-chamada" style="
                padding: 12px 24px; border: none; border-radius: 8px;
                background: #f44336; color: white; cursor: pointer;
                font-weight: bold; flex: 1; font-size: 16px; transition: 0.2s;">
                Ignorar
            </button>
            <button id="btn-atender-chamada" style="
                padding: 12px 24px; border: none; border-radius: 8px;
                background: #4CAF50; color: white; cursor: pointer;
                font-weight: bold; flex: 1; font-size: 16px; transition: 0.2s;">
                Atender
            </button>
        </div>
    `;

    if (!document.getElementById('sip-modal-animations')) {
        const style = document.createElement('style');
        style.id = 'sip-modal-animations';
        style.innerHTML = `
            @keyframes modalPopIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
            @keyframes pulseRing { 0% { transform: scale(0.9); } 50% { transform: scale(1.1); } 100% { transform: scale(0.9); } }
            #btn-rejeitar-chamada:hover { background: #d32f2f !important; transform: translateY(-2px); }
            #btn-atender-chamada:hover { background: #45a049 !important; transform: translateY(-2px); }
        `;
        document.head.appendChild(style);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    document.getElementById('btn-atender-chamada').addEventListener('click', () => {
        document.body.removeChild(overlay);
        makeDirectSipCall('8888'); 
    });

    document.getElementById('btn-rejeitar-chamada').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
}

export const hangupCall = () => {
    if (currentSession) {
        currentSession.terminate();
        currentSession = null;
    }
};

export function mostrarModalChamadaAtiva(nome, ip) {
    fecharModalChamadaAtiva();

    const overlay = document.createElement('div');
    overlay.id = 'modal-chamada-ativa';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0, 0, 0, 0.85); display: flex; flex-direction: column;
        align-items: center; justify-content: center; z-index: 10000;
        backdrop-filter: blur(5px); font-family: 'Segoe UI', Tahoma, sans-serif;
    `;

    const urlCamera = `http://${ip}/video_front.mjpeg`; 

    overlay.innerHTML = `
        <h2 style="margin: 0 0 5px; color: #4CAF50; font-size: 28px; animation: blink 1.5s infinite;">Em Chamada...</h2>
        <p style="margin: 0 0 20px; color: #ddd; font-size: 18px;">${nome} (${ip})</p>
        
        <div style="width: 480px; height: 320px; background: #222; border-radius: 12px; margin-bottom: 30px; overflow: hidden; border: 2px solid #555; display: flex; align-items: center; justify-content: center; position: relative;">
            <img src="${urlCamera}" style="width: 100%; height: 100%; object-fit: cover;" alt="Câmera da Facial" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <span style="color: #888; display: none;">Câmera Indisponível / Requer Autenticação</span>
        </div>

        <button id="btn-encerrar-ativa" style="
            padding: 16px 40px; background: #f44336; color: white; border: none;
            border-radius: 50px; font-size: 18px; font-weight: bold; cursor: pointer;
            box-shadow: 0 4px 15px rgba(244, 67, 54, 0.4); transition: 0.2s;
        ">
            🔴 Encerrar Chamada
        </button>
        
        <style>
            @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
            #btn-encerrar-ativa:hover { transform: scale(1.05); background: #d32f2f; }
        </style>
    `;

    document.body.appendChild(overlay);

    document.getElementById('btn-encerrar-ativa').addEventListener('click', async () => {
        hangupCall();
        fecharModalChamadaAtiva();
        
        try {
            await fetch('/api/sip/matar-catraca', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
                body: JSON.stringify({ ip: ip })
            });
        } catch (err) {}
    });
}

export function fecharModalChamadaAtiva() {
    const modal = document.getElementById('modal-chamada-ativa');
    if (modal) modal.remove();
}
