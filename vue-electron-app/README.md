# vue-electron-app

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

#### Known problems if production build does not start

###### polygon_quote_mapping is not defined

Navigate to
```
node_modules\@alpacahq\alpaca-trade-api\lib\resources\entity.js
```
Go to line 51 and add keyword `let` in front of `polygon_quote_mapping`
so it should look like
```
let polygon_quote_mapping = {
    "sym": "symbol",
    "ax": "askexchange",
    "ap": "askprice",
    "as": "asksize",
    "bx": "bidexchange",
    "bp": "bidprice",
    "bs": "bidsize",
    "c": "condition",
    "t": "timestamp"
};
```
Bug has been reported to Alpaca: https://github.com/alpacahq/alpaca-trade-api-js/issues/136


### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
