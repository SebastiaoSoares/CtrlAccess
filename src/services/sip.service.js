import logger from '../utils/logger.js';
import { sendCommand } from './controlid.service.js';

class SipService {

  async checkProMode(device) {
    logger.info(`[SIP] Verificando modo PRO no dispositivo ${device.ip}`);
    const endpoint = '/get_configuration.fcgi';
    const body = { general: ["enterprise_mode"] };
    
    try {
      const response = await sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
      
      const isPro = response?.general?.enterprise_mode === "1";
      return isPro;
    } catch (error) {
      logger.error(`[SIP] Erro ao verificar modo PRO no IP ${device.ip}: ${error.message}`);
      throw new Error("Falha ao verificar licenciamento do dispositivo.");
    }
  }

  async enableSipConfig(device, sipParams) {
    logger.info(`[SIP] Configurando e ativando SIP no dispositivo ${device.ip}`);
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
      return { success: true, message: "Parâmetros SIP configurados e ativados com sucesso." };
    } catch (error) {
      logger.error(`[SIP] Erro ao ativar SIP no IP ${device.ip}: ${error.message}`);
      throw new Error("Falha ao aplicar configurações SIP no equipamento.");
    }
  }

  async makeCall(device, target) {
    if (!target) throw new Error("O ramal de destino é obrigatório.");
    
    logger.info(`[SIP] Iniciando chamada para o ramal ${target} no IP ${device.ip}`);
    const endpoint = '/make_sip_call.fcgi';
    const body = { target: target };
    
    try {
      await sendCommand(device.ip, device.port, endpoint, body, device.username, device.password);
      return { success: true, message: `Chamada iniciada para o ramal ${target}` };
    } catch (error) {
      logger.error(`[SIP] Erro ao iniciar chamada no IP ${device.ip}: ${error.message}`);
      throw new Error("Falha ao comunicar com o dispositivo para iniciar a chamada.");
    }
  }

  async finalizeCall(device) {
    logger.info(`[SIP] Finalizando chamada no IP ${device.ip}`);
    const endpoint = '/finalize_sip_call.fcgi';
    
    try {
      await sendCommand(device.ip, device.port, endpoint, {}, device.username, device.password);
      return { success: true, message: "Chamada finalizada com sucesso." };
    } catch (error) {
      logger.error(`[SIP] Erro ao finalizar chamada no IP ${device.ip}: ${error.message}`);
      throw new Error("Falha ao comunicar com o dispositivo para finalizar a chamada.");
    }
  }

  async getStatus(device) {
    const endpoint = '/get_sip_status.fcgi';
    
    try {
      const response = await sendCommand(device.ip, device.port, endpoint, {}, device.username, device.password);
      return response;
    } catch (error) {
      logger.error(`[SIP] Erro ao consultar status no IP ${device.ip}: ${error.message}`);
      throw new Error("Falha ao obter o status SIP do dispositivo.");
    }
  }
}

export const sipService = new SipService();
