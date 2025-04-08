const { Command } = require('commander');
const http = require('http');
const fs = require('fs/promises');
const { create } = require('xmlbuilder2');

const program = new Command();

program
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-i, --input <path>', 'Path to input file');

program.parse(process.argv);

const options = program.opts();

async function handleRequest(req, res) {
  try {
    const data = await fs.readFile(options.input, 'utf-8');
    const json = JSON.parse(data);

    const filtered = json.filter(item => item.parent === 'BS3_BanksLiab');

    const xml = create({ version: '1.0' })
      .ele('data')
      .ele(
        filtered.map(item => ({
          indicators: {
            txt: item.txt,
            value: item.value
          }
        }))
      )
      .end({ prettyPrint: true });

    res.writeHead(200, { 'Content-Type': 'application/xml' });
    res.end(xml);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Error processing request');
    console.error(err);
  }
}

const server = http.createServer(handleRequest);

server.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}/`);
});
