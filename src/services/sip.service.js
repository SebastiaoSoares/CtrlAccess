import logger from '../utils/logger.js';
import { sendCommand } from './controlid.service.js';

class SipService {
  constructor() {}

  async checkProMode(device) {
    logger.info(`[SIP] Verificando modo PRO no dispositivo ${device.ip}`);
    const endpoint = '/get_configuration.fcgi';
    const body = { general: ["enterprise_mode"] };
    
    try {
      const response = await sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
      return response?.general?.enterprise_mode === "1";
    } catch (error) {
      logger.error(`[SIP] Erro ao verificar modo PRO: ${error.message}`);
      throw new Error("Falha ao verificar licenciamento do dispositivo.");
    }
  }

  async enableSipConfig(device, sipParams) {
    logger.info(`[SIP] Configurando SIP no dispositivo ${device.ip}`);
    const endpoint = '/set_configuration.fcgi';
    const body = {
      sip: {
        enabled: "1",
        server_ip: sipParams.serverIp,
        user: sipParams.user,
        password: sipParams.password,
        display_name: sipParams.displayName || "CtrlAccess SIP"
      }
    };

    try {
      await sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
      return { success: true, message: "SIP ativado com sucesso." };
    } catch (error) {
      logger.error(`[SIP] Erro ao ativar SIP: ${error.message}`);
      throw new Error("Falha ao aplicar configurações SIP.");
    }
  }

  async makeCall(device, target) {
    logger.info(`[SIP] Iniciando chamada para o ramal ${target} no IP ${device.ip}`);
    const endpoint = '/make_sip_call.fcgi';
    
    try {
      await sendCommand(device.ip, device.port, endpoint, { target: target }, device.username, device.password);
      return { success: true, message: `Chamada iniciada para ${target}` };
    } catch (error) {
      throw new Error("Falha ao iniciar a chamada no dispositivo.");
    }
  }

  async finalizeCall(device) {
    logger.info(`[SIP] Finalizando chamada no IP ${device.ip}`);
    const endpoint = '/finalize_sip_call.fcgi';
    
    try {
      await sendCommand(device.ip, device.port, endpoint, {}, device.username, device.password);
      return { success: true };
    } catch (error) {
      throw new Error("Falha ao finalizar a chamada.");
    }
  }

  
}

export const sipService = new SipService();
