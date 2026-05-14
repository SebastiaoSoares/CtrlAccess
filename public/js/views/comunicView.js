let player = null;

export const startMonitoring = async (deviceIp, username, password) => {
    try {
        const response = await fetch('/api/comunic/action/monitor/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                deviceIp: deviceIp, 
                username: username || 'admin', 
                password: password || 'admin' 
            }) 
        });

        if (!response.ok) throw new Error('Falha na comunicação com o servidor');
        
        const data = await response.json();

        const modal = document.getElementById('intercom-modal');
        modal.style.display = 'block';
        
        modal.dataset.currentIp = deviceIp; 
        modal.dataset.currentUsername = username;
        modal.dataset.currentPassword = password;

        const canvas = document.getElementById('video-canvas');
        const wsUrl = `ws://localhost:${data.port}`;
        
        if (player) player.destroy(); 
        
        player = new JSMpeg.Player(wsUrl, { 
            canvas: canvas, 
            autoplay: true,
            audio: true,
            volume: 1
        });

    } catch (error) {
        alert('Erro ao tentar conectar com a câmera. Verifique os logs.');
        console.error(error);
    }
}

export const stopMonitoring = async () => {
    const modal = document.getElementById('intercom-modal');
    const deviceIp = modal.dataset.currentIp;

    if (player) {
        player.destroy();
        player = null;
    }
    
    modal.style.display = 'none';
    delete modal.dataset.currentIp;

    if (deviceIp) {
        await fetch('/api/comunic/action/monitor/stop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceIp: deviceIp })
        });
    }
}

const intercomModal = document.createElement('div');
intercomModal.innerHTML = /*html*/`
    <div id="intercom-modal" class="modal" style="display: none; position: fixed; top: 10%; left: 50%; transform: translateX(-50%); background: #fff; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 9999; border-radius: 8px;">
        
        <h3 style="margin-top: 0;">Câmera ao vivo</h3>
        
        <canvas id="video-canvas" width="640" height="480" style="background: #000; border-radius: 4px; display: block; margin-bottom: 15px;"></canvas>

        <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button class="btn-stop-monitoring" data-action="stop-monitor" style="padding: 8px 16px; cursor: pointer; background: #ef4444; color: white; border: none; border-radius: 4px;">
                Encerrar Visão
            </button>
        </div>
    </div>`;

document.body.appendChild(intercomModal);

intercomModal.querySelector('.btn-stop-monitoring').addEventListener('click', () => {
    stopMonitoring();
});