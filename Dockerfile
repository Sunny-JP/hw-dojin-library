FROM node:20-alpine

# アプリケーションのコードを置くディレクトリを作成
WORKDIR /app

# 最初に依存関係のみをインストール（キャッシュを効かせるため）
COPY app/package*.json ./
RUN npm install

# アプリケーションのソースコードをコピー
COPY app/ .

# Next.jsアプリを開発モードで起動
CMD ["npm", "run", "dev"]