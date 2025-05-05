gcloud auth application-default login
gcloud config set account rtroman14@gmail.com
gcloud config set project webagent-394323

gcloud run deploy cr-bps-proposal-builder \
 --allow-unauthenticated \
 --region=us-central1 \
 --timeout=180s \
 --source=. \
 --env-vars-file=.env.yaml
