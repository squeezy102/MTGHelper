const fs   = require('fs');
const path = require('path');

const LOG_DIR  = path.join(__dirname, '../../logs');
const LOG_PATH = path.join(LOG_DIR, 'app.log');

const ANSI = {
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  reset:  '\x1b[0m',
};

function timestamp() {
  return new Date().toISOString().replace('T', ' ').slice(0, 23);
}

class LogService {
  constructor() {
    if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
    const header = `${'─'.repeat(60)}\nSession started: ${new Date().toISOString()}\n${'─'.repeat(60)}\n`;
    fs.writeFileSync(LOG_PATH, header);
  }

  info(tag, message)  { this._log('INFO ', ANSI.green,  tag, message); }
  warn(tag, message)  { this._log('WARN ', ANSI.yellow, tag, message); }
  error(tag, message) { this._log('ERROR', ANSI.red,    tag, message); }

  _log(level, color, tag, message) {
    const line = `[${timestamp()}] [${level}] [${tag}] ${message}`;
    console.log(`${color}${line}${ANSI.reset}`);
    this._write(line);
  }

  _write(text) {
    try { fs.appendFileSync(LOG_PATH, text + '\n'); } catch { /* never let logging crash the app */ }
  }
}

module.exports = new LogService();
