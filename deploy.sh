#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t janblaha .
docker tag janblaha pofider/janblaha:$TRAVIS_TAG
docker push pofider/janblaha

git clone https://github.com/pofider/kubernetes.git
cd kubernetes
chmod +x push.sh
./push.sh "janblaha" "pofider/janblaha"