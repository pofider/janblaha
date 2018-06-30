#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t janblaha .
docker tag janblaha pofider/janblaha:$TRAVIS_TAG
docker push pofider/janblaha

sudo apt-get install -y ruby
sudo curl https://hub.github.com/standalone -Lo /usr/bin/hub
sudo chmod 755 /usr/bin/hub

 hub clone "pofder/kubernetes"
 cd kubernetes

sed -i 's/\$tag/'"$TRAVIS_TAG"'/g' ./kubernetes/janblaha-staging-deployment.yaml
hub add kubernetes/deployments/janblaha-staging-deployment.yaml

hub commit -F- <<EOF
    Update the janblaha application    
EOF

hub push origin master