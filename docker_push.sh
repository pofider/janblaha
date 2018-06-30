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