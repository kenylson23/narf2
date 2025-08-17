import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { SitemapStream } from 'sitemap';
import { Readable } from 'stream';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Links para incluir no sitemap
const links = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/sobre', changefreq: 'weekly', priority: 0.8 },
  { url: '/cursos', changefreq: 'weekly', priority: 0.8 },
  { url: '/contato', changefreq: 'weekly', priority: 0.7 },
  { url: '/blog', changefreq: 'weekly', priority: 0.9 },
];

// Função para gerar o sitemap
async function generateSitemap() {
  try {
    // Cria o stream do sitemap
    const stream = new SitemapStream({ hostname: 'https://colegionarfive.ao' });
    
    // Cria o diretório de saída se não existir
    const outDir = resolve(__dirname, '../dist');
    if (!existsSync(outDir)) {
      mkdirSync(outDir, { recursive: true });
    }
    
    // Cria um stream legível a partir dos links
    const readable = Readable.from(links);
    
    // Pipe para o SitemapStream
    const pipeline = readable.pipe(stream);
    
    // Coleta os dados do stream
    let data = '';
    for await (const chunk of stream) {
      data += chunk;
    }
    
    // Escreve o sitemap no arquivo
    writeFileSync(join(outDir, 'sitemap.xml'), data);
    console.log('Sitemap gerado com sucesso!');
  } catch (error) {
    console.error('Erro ao gerar sitemap:', error);
    process.exit(1);
  }
}

// Executa a geração do sitemap
generateSitemap();
