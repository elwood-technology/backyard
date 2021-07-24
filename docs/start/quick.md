# Quick Start


## 1. Create a Backyard workspace
```
yarn create backyard hello-world -ts
```

## 2. Initialize the local workspace
```
cd hello-world
yarn backyard init --local
```

## 3. Start the workspace
```
yarn backyard local start
```

## 4. Open the workspace dashboard
Before you can access the dashboard, you will need to setup your root admin account.

```
http://localhost:8080/auth/setup
```

You will need your "Operator Token" to complete the setup. You can find it in `.backyard/local/info.txt` if you don't know it.
