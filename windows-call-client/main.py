import asyncio
import websockets
import json
import webbrowser
from win11toast import toast

WS_URL = "ws://localhost:3000" 

def atender_chamada(args):

    print("Abrindo interface do CtrlAccess...")
    webbrowser.open("http://localhost:3000")

async def escutar_servidor():
    async with websockets.connect(WS_URL) as websocket:
        print("Python Notificador conectado ao CtrlAccess!")
        
        while True:
            mensagem = await websocket.recv()
            dados = json.loads(mensagem)
            
            if dados.get("evento") == "chamada_recebida":
                dispositivo = dados.get("dispositivo", "Terminal Facial")
                print(f"Chamada recebida de: {dispositivo}")
                
                toast(
                    "Interfonia: Nova chamada", 
                    f"O dispositivo {dispositivo} está chamando.", 
                    on_click=atender_chamada,
                    audio="ms-winsoundevent:Notification.Looping.Call",
                    duration="long"
                )

if __name__ == "__main__":
    asyncio.run(escutar_servidor())
