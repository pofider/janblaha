#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t janblaha .
docker tag janblaha pofider/janblaha:$TRAVIS_TAG
docker push pofider/janblaha

AZ_REPO=$(lsb_release -cs)
echo "deb [arch=amd64] https://packages.microsoft.com/repos/azure-cli/ $AZ_REPO main" | \
    sudo tee /etc/apt/sources.list.d/azure-cli.list
curl -L https://packages.microsoft.com/keys/microsoft.asc | sudo apt-key add     
sudo apt-get install apt-transport-https -y
sudo apt-get update && sudo apt-get install -y azure-cli

az login --service-principal --username $AZ_APP_ID --password $AZ_PASSWORD --tenant $AZ_TENANT
sudo az aks install-cli
sudo az aks get-credentials --resource-group test --name test

sed -i 's/\$tag/'"$TRAVIS_TAG"'/g' ./kubernetes/janblaha-staging-deployment.yaml
sudo kubectl apply -f ./kubernetes/janblaha-staging-deployment.yaml