const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const dbPath = path.join(__dirname, 'tokens.db');
const db = new sqlite3.Database(dbPath);

// Inicializar tabelas
db.serialize(() => {
  // Tabela de tokens de acesso
  db.run(`CREATE TABLE IF NOT EXISTS tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    duration_days INTEGER NOT NULL,
    is_active INTEGER DEFAULT 1,
    last_used DATETIME
  )`);

  // Tabela de configuração do admin
  db.run(`CREATE TABLE IF NOT EXISTS admin_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    password_hash TEXT NOT NULL
  )`);

  // Criar senha padrão do admin se não existir: "a1b2c3d4"
  const defaultPasswordHash = crypto
    .createHash('sha256')
    .update('a1b2c3d4')
    .digest('hex');

  db.run(
    `INSERT OR IGNORE INTO admin_config (id, password_hash) VALUES (1, ?)`,
    [defaultPasswordHash]
  );
});

// Funções para gerenciar tokens
const tokenManager = {
  // Gerar token único
  generateToken() {
    return 'SUPER-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  },

  // Criar novo token
  createToken(durationDays) {
    return new Promise((resolve, reject) => {
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + durationDays);

      db.run(
        `INSERT INTO tokens (token, expires_at, duration_days) VALUES (?, ?, ?)`,
        [token, expiresAt.toISOString(), durationDays],
        function (err) {
          if (err) reject(err);
          else
            resolve({
              id: this.lastID,
              token,
              expiresAt: expiresAt.toISOString(),
              durationDays,
            });
        }
      );
    });
  },

  // Validar token
  validateToken(token) {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();

      db.get(
        `SELECT * FROM tokens WHERE token = ? AND is_active = 1`,
        [token],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            resolve({ valid: false, reason: 'Token não encontrado' });
          } else if (row.expires_at < now) {
            resolve({ valid: false, reason: 'Token expirado' });
          } else {
            // Atualizar último uso
            db.run(
              `UPDATE tokens SET last_used = CURRENT_TIMESTAMP WHERE token = ?`,
              [token]
            );
            resolve({ valid: true, token: row });
          }
        }
      );
    });
  },

  // Listar todos os tokens
  listTokens() {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();

      db.all(
        `SELECT
          id,
          token,
          created_at,
          expires_at,
          duration_days,
          is_active,
          last_used,
          CASE
            WHEN expires_at < ? THEN 'expirado'
            WHEN is_active = 0 THEN 'revogado'
            ELSE 'ativo'
          END as status,
          CAST((julianday(expires_at) - julianday(?)) AS INTEGER) as days_remaining
        FROM tokens
        ORDER BY created_at DESC`,
        [now, now],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  },

  // Revogar token
  revokeToken(tokenId) {
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE tokens SET is_active = 0 WHERE id = ?`,
        [tokenId],
        function (err) {
          if (err) reject(err);
          else resolve({ success: true, changes: this.changes });
        }
      );
    });
  },

  // Deletar token
  deleteToken(tokenId) {
    return new Promise((resolve, reject) => {
      db.run(`DELETE FROM tokens WHERE id = ?`, [tokenId], function (err) {
        if (err) reject(err);
        else resolve({ success: true, changes: this.changes });
      });
    });
  },

  // Estender duração do token
  extendToken(tokenId, additionalDays) {
    return new Promise((resolve, reject) => {
      db.get(`SELECT * FROM tokens WHERE id = ?`, [tokenId], (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          reject(new Error('Token não encontrado'));
        } else {
          const newExpiresAt = new Date(row.expires_at);
          newExpiresAt.setDate(newExpiresAt.getDate() + additionalDays);

          db.run(
            `UPDATE tokens SET expires_at = ?, duration_days = duration_days + ? WHERE id = ?`,
            [newExpiresAt.toISOString(), additionalDays, tokenId],
            function (err) {
              if (err) reject(err);
              else resolve({ success: true, newExpiresAt });
            }
          );
        }
      });
    });
  },

  // Estatísticas
  getStats() {
    return new Promise((resolve, reject) => {
      const now = new Date().toISOString();

      db.get(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN is_active = 1 AND expires_at > ? THEN 1 ELSE 0 END) as active,
          SUM(CASE WHEN expires_at < ? THEN 1 ELSE 0 END) as expired,
          SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) as revoked
        FROM tokens`,
        [now, now],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  },
};

// Funções para admin
const adminManager = {
  // Validar senha do admin
  validatePassword(password) {
    return new Promise((resolve, reject) => {
      const passwordHash = crypto
        .createHash('sha256')
        .update(password)
        .digest('hex');

      db.get(
        `SELECT * FROM admin_config WHERE id = 1 AND password_hash = ?`,
        [passwordHash],
        (err, row) => {
          if (err) reject(err);
          else resolve(!!row);
        }
      );
    });
  },

  // Alterar senha do admin
  changePassword(newPassword) {
    return new Promise((resolve, reject) => {
      const passwordHash = crypto
        .createHash('sha256')
        .update(newPassword)
        .digest('hex');

      db.run(
        `UPDATE admin_config SET password_hash = ? WHERE id = 1`,
        [passwordHash],
        function (err) {
          if (err) reject(err);
          else resolve({ success: true });
        }
      );
    });
  },
};

module.exports = {
  db,
  tokenManager,
  adminManager,
};
