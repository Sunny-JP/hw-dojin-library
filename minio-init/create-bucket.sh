#!/bin/sh
set -e

# MinIOサーバーが起動するまで待機する
# mc alias set コマンドが成功するまで1秒ごとにリトライ
until mc alias set myminio http://storage:9000 "$MINIO_ROOT_USER" "$MINIO_ROOT_PASSWORD"; do
    echo "Waiting for MinIO server to be ready..."
    sleep 1
done

echo "MinIO server is ready."

# バケットが存在しない場合のみ作成する
# || true を付けることで、既にバケットが存在してもエラーで停止しないようにする
mc mb "myminio/$MINIO_BUCKET_NAME" || true

echo "Bucket '$MINIO_BUCKET_NAME' created or already exists."

# バケットのアクセスポリシーを 'public' (匿名での読み取り許可) に設定する
# これが AccessDenied エラーを解決する重要なコマンド
mc anonymous set public "myminio/$MINIO_BUCKET_NAME"

echo "Bucket policy for '$MINIO_BUCKET_NAME' is set to public."
echo "MinIO initialization complete."
