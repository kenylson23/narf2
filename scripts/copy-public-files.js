#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const sourceDir = path.join(__dirname, '..', 'public');
const destDir = path.join(__dirname, '..', 'dist');

// Ignore specific files that shouldn't be copied
const ignoreFiles = ['.DS_Store', 'Thumbs.db', '.gitkeep'];

// Função para verificar se o arquivo deve ser ignorado
function shouldIgnoreFile(filePath) {
  const fileName = path.basename(filePath);
  return ignoreFiles.includes(fileName);
}

// Função para copiar arquivos de forma assíncrona
async function copyFile(source, target) {
  return new Promise((resolve, reject) => {
    const rd = fs.createReadStream(source);
    rd.on('error', reject);
    
    const wr = fs.createWriteStream(target);
    wr.on('error', reject);
    wr.on('close', () => resolve(true));
    
    rd.pipe(wr);
  });
}

// Função para criar diretório se não existir
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Criando diretório: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Função principal para copiar arquivos públicos
async function copyPublicFiles() {
  try {
    console.log('Iniciando cópia de arquivos públicos...');
    
    // Verifica se o diretório de origem existe
    if (!fs.existsSync(sourceDir)) {
      console.log(`Diretório de origem não encontrado: ${sourceDir}`);
      return true; // Não é um erro fatal
    }

    // Cria o diretório de destino se não existir
    ensureDirectoryExists(destDir);

    // Lê o conteúdo do diretório de origem
    const files = fs.readdirSync(sourceDir, { withFileTypes: true });
    
    // Filtra e copia os arquivos
    const copyPromises = files.map(async (file) => {
      const sourcePath = path.join(sourceDir, file.name);
      const destPath = path.join(destDir, file.name);
      
      if (shouldIgnoreFile(file.name)) {
        console.log(`Ignorando arquivo: ${file.name}`);
        return;
      }
      
      if (file.isDirectory()) {
        // Se for um diretório, cria a estrutura de pastas
        ensureDirectoryExists(destPath);
        
        // Copia os arquivos do subdiretório recursivamente
        const subDirFiles = fs.readdirSync(sourcePath);
        for (const subFile of subDirFiles) {
          await copyPublicFiles(
            path.join(sourcePath, subFile),
            path.join(destPath, subFile)
          );
        }
      } else if (file.isFile()) {
        // Se for um arquivo, copia para o destino
        console.log(`Copiando: ${file.name}`);
        await copyFile(sourcePath, destPath);
      }
    });

    // Aguarda todas as operações de cópia serem concluídas
    await Promise.all(copyPromises);
    
    console.log('Arquivos públicos copiados com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao copiar arquivos públicos:');
    console.error(error);
    process.exit(1);
  }
}

// Executa a função principal
copyPublicFiles().catch(error => {
  console.error('Erro inesperado:');
  console.error(error);
  process.exit(1);
});
