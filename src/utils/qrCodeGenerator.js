import QRCode from 'qrcode';
import fs from 'fs/promises';
import path from 'path';

/**
 * Gera um QR Code em formato PNG e salva no diretório especificado
 * @param {string} data - Dados a serem codificados no QR Code
 * @param {string} outputPath - Caminho onde o QR Code será salvo
 * @returns {Promise<string>} - Caminho do arquivo gerado
 */
export async function generateQRCode(data, outputPath) {
  try {
    // Garante que o diretório existe
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Gera o QR Code
    await QRCode.toFile(outputPath, data, {
      type: 'png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    });

    return outputPath;
  } catch (error) {
    console.error('Erro ao gerar QR Code:', error);
    throw error;
  }
} 