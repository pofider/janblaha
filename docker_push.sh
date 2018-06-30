#!/bin/bash
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t janblaha .
docker tag janblaha pofider/janblaha:$TRAVIS_TAG
docker push pofider/janblaha

sudo add-apt-repository ppa:cpick/hub
sudo apt-get update
sudo apt-get install hub -y

 hub clone "pofder/kubernetes"
 cd kubernetes
 cat <<EOF > patch.yaml
spec:
    template:
        spec:
            containers:
                - name: janblaha-staging
                  image: pofider/janblaha:${TRAVIS_TAG}
EOF

kubectl patch --local -o yaml \
          -f kubernetes/deployments/janblaha-staging-deployment.yaml \
          -p "$(cat patch.yaml)" \
          > janblaha-staging-deployment.yaml

mv janblaha-staging-deployment.yaml kubernetes/deployments/janblaha-staging-deployment.yaml          

hub add kubernetes/deployments/janblaha-staging-deployment.yaml

hub commit -F- <<EOF
    Update the janblaha application    
EOF

hub push origin master