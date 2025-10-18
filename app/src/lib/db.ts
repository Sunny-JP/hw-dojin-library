import postgres from 'postgres';

// 1. 接続文字列をDATABASE_URLから取得
const connectionString = process.env.DATABASE_URL!;

// 2. グローバル変数を宣言
declare global {
  // eslint-disable-next-line no-var
  var sql: postgres.Sql | undefined;
}

let sql: postgres.Sql;

if (process.env.NODE_ENV === 'production') {
  // 本番環境では新しい接続を作成
  sql = postgres(connectionString);
} else {
  // 開発環境では、グローバルにキャッシュされた接続を再利用
  if (!global.sql) {
    global.sql = postgres(connectionString);
  }
  sql = global.sql;
}

// 3. シングルトンの 'sql' 関数をエクスポート
export { sql };