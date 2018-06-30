#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t janblaha .
docker tag janblaha pofider/janblaha:$TRAVIS_TAG
docker push pofider/janblaha

sudo add-apt-repository -y ppa:cpick/hub
sudo apt-get update
sudo apt-get install -y hub

hub config --global user.email "honza.pofider@seznam.cz"
hub config --global user.name "pofider"
hub clone "https://github.com/pofider/kubernetes.git"
cd kubernetes
hub config remote.origin.url https://pofider:${GITHUB_TOKEN}@github.com/pofider/kubernetes.git

sed -i 's/pofider\/janblaha\:\(.*\)/pofider\/janblaha\:'"$TRAVIS_TAG"'/' ./kubernetes/janblaha-staging-deployment.yaml
hub add kubernetes/janblaha-staging-deployment.yaml

hub commit -m "Update the janblaha application"

hub push origin master