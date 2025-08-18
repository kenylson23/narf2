import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';
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
    console.log('Iniciando geração do sitemap...');
    
    // Configuração do sitemap
    const sitemapOptions = { 
      hostname: 'https://colegionarfive.ao',
      lastmodDateOnly: false,
      xmlns: {
        news: false,
        xhtml: true,
        image: false,
        video: false
      }
    };
    
    // Cria o stream do sitemap
    const stream = new SitemapStream(sitemapOptions);
    
    // Cria o diretório de saída se não existir
    const outDir = resolve(__dirname, '../dist');
    if (!existsSync(outDir)) {
      console.log(`Criando diretório de saída: ${outDir}`);
      mkdirSync(outDir, { recursive: true });
    }
    
    // Cria um stream legível a partir dos links
    const readable = Readable.from(links);
    
    // Pipe para o SitemapStream
    const pipeline = readable.pipe(stream);
    
    // Gera o sitemap
    const sitemap = await streamToPromise(pipeline);
    
    // Escreve o sitemap no arquivo
    const sitemapPath = join(outDir, 'sitemap.xml');
    writeFileSync(sitemapPath, sitemap.toString());
    
    console.log(`Sitemap gerado com sucesso em: ${sitemapPath}`);
    return true;
  } catch (error) {
    console.error('Erro ao gerar sitemap:');
    console.error(error);
    process.exit(1);
  }
}

// Executa a geração do sitemap
generateSitemap();
