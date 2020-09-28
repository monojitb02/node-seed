# patform-api

Run the below commands to do a test ride
```
kubectl create -f kube.app.deployment.yaml
kubectl create -f kube.app.service.yaml
```
Try accessing http://localhost:30007 in your local.

OR

```
docker-compose up
```
Try accessing http://localhost:3000 in your local.

# Testing
Run the below commands to run the unit tests
```
docker-compose -f docker-compose.test.yaml up
```
Run the below commands to run the prostman tests
```
npm install -g newman
docker-compose up --build -d
newman run ./test/api/Test_auth.postman_collection.json
```