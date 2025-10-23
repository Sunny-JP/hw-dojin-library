#!/bin/sh
set -e # エラーが発生したらスクリプトを停止

echo 'Waiting for RustFS server...'
# AWS CLI で接続できるまで待機 (簡易的なリトライ)
# $$ は docker-compose.yml 内でのエスケープが不要になる
until aws s3 ls --endpoint-url ${AWS_ENDPOINT_URL} > /dev/null 2>&1; do
    echo 'RustFS not ready yet, retrying in 3 seconds...';
    sleep 3;
done;

# バケット名を変数に格納 (デフォルト値も設定)
BUCKET_NAME=${S3_BUCKET_NAME:-doujinshi-thumbnails}

echo "1. Creating bucket '${BUCKET_NAME}' (if not exists)..."
# mb コマンド
aws s3 mb s3://${BUCKET_NAME} --endpoint-url ${AWS_ENDPOINT_URL} || echo "Bucket '${BUCKET_NAME}' already exists or failed to create."

echo "2. Preparing policy file..."
# policy.json 内のプレースホルダーを実際のバケット名に置換
# スクリプト内なので ${S3_BUCKET_NAME} を直接使える
sed -i "s/\${S3_BUCKET_NAME}/${BUCKET_NAME}/g" /aws/config/policy.json

echo "3. Setting bucket policy to public read-only..."
# put-bucket-policy でポリシーを適用
aws s3api put-bucket-policy --bucket ${BUCKET_NAME} --policy file:///aws/config/policy.json --endpoint-url ${AWS_ENDPOINT_URL}

echo 'RustFS initialization complete.'
exit 0