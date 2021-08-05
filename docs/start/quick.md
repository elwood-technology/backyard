# Quick Start


## 1. Create a Backyard workspace
```
yarn create backyard ./hello-world typescript
```

## 2. Initialize the local workspace
```
cd hello-world
```

## 3. Start the workspace
```
yarn backyard local start
```

## 4. Make a request
Now you can start making request to the gateway!

```
curl http://localhost:8000/health

#> {"message":"awesome :)"}
```
