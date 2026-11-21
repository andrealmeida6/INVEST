/* Monta 3 - Mockups/mockup-final.html (e index.html, para o GitHub Pages) a partir das web pages, snippets e templates.
   O mockup nao se edita a mao: correr "node gerar-mockup.js" nesta pasta depois de cada alteracao.
   Mesmo processo do ON: {{ snippets['X/Y'] }} e {% include 'nome' param: 'v' %}. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const cod = __dirname, raiz = path.dirname(cod);
const ler = (...p) => fs.readFileSync(path.join(cod, ...p), 'utf8');
const ORDEM = ['Inicio', 'Instrumentos', 'Instrumento', 'Carteiras', 'Posicoes', 'Afetacoes', 'Operacoes', 'Valorizacoes', 'Imparidade', 'Limites', 'Contabilidade', 'Movimentos', 'Reconciliacoes', 'Relatorios', 'Aprovacoes', 'Trilho', 'Backoffice'];

const resolver = (html) => html
  .replace(/\{\{\s*snippets\['([^']+)'\]\s*\}\}/g, (_, nome) => {
    const f = ['content-snippets', ...nome.split('/')];
    f[f.length - 1] += '.html';
    return '<!-- snippet: ' + nome + ' -->\n' + resolver(ler(...f));
  })
  .replace(/\{%\s*include\s+'([^']+)'((?:\s+\w+:\s*'[^']*',?)*)\s*%\}/g, (_, nome, params) => {
    let t = ler('web-templates', nome + '.html');
    for (const m of params.matchAll(/(\w+):\s*'([^']*)'/g)) t = t.split('{{ ' + m[1] + ' }}').join(m[2]);
    return '<!-- template: ' + nome + ' -->\n' + resolver(t);
  });

const naoUsadas = fs.readdirSync(path.join(cod, 'web-pages')).filter((d) => !ORDEM.includes(d));
if (naoUsadas.length) throw new Error('Web pages fora do mockup: ' + naoUsadas.join(', '));
const paginas = ORDEM.map((n) => '<!-- web page: ' + n + ' -->\n' + resolver(ler('web-pages', n, n + '.webpage.copy.html')).replace('data-pagina=', 'hidden data-pagina=')).join('\n');
const html = resolver(ler('web-templates', 'layout-portal.html').replace(/\{%\s*block main\s*%\}\{%\s*endblock\s*%\}/, () => paginas));

/* Cada ficheiro leva ?v= com a impressao digital do conteudo, para o browser nao usar uma versao antiga em cache */
const versao = (f) => { try { return '?v=' + crypto.createHash('md5').update(fs.readFileSync(path.join(cod, 'web-files', f))).digest('hex').slice(0, 8); } catch (er) { return ''; } };
/* Supabase (mesmo projeto do ON, tabelas inv_). A chave publicavel foi feita para estar no navegador:
   quem protege os dados e o RLS e as funcoes de supabase/001_inv_esquema.sql */
const BACKEND = { url: 'https://yujhfscnnngaivwwunom.supabase.co', chave: 'sb_publishable_wU6S2mgSbmnTzz4hQMKZ6g_jTj6MMgo' };
const montar = (web) => html.replace(/(href|src)="\/(global\.css|[\w.-]+\.(?:js|png))"/g, (_, a, f) => a + '="' + web + f + versao(f) + '"')
  .replace('<script src="' + web + 'inv-motor.js', () => '<script>window.INV_BACKEND = ' + JSON.stringify(BACKEND) + ';</script>\n<script src="' + web + 'inv-motor.js');

const mockup = '<!-- Gerado por gerar-mockup.js. Nao editar: alterar as web pages, snippets ou templates. -->\n' + montar(encodeURI('../' + path.basename(cod) + '/web-files/'));
fs.writeFileSync(path.join(raiz, '3 - Mockups', 'mockup-final.html'), mockup, 'utf8');
/* index.html na raiz para o GitHub Pages, sem os comentarios de origem dos blocos */
fs.writeFileSync(path.join(raiz, 'index.html'), montar(encodeURI(path.basename(cod) + '/web-files/')).replace(/<!--[\s\S]*?-->\s*/g, ''), 'utf8');
console.log('mockup-final.html e index.html: ' + ORDEM.length + ' web pages, ' + (mockup.match(/<!-- snippet:/g) || []).length + ' snippets, ' + (mockup.match(/<!-- template:/g) || []).length + ' templates, ' + mockup.length + ' caracteres');
