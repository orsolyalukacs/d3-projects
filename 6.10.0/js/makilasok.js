/*
*    main.js
*    Mastering Data Visualization with D3.js
*    CoinStats
*/



// avoid webpack double-rendering
if (!document.getElementsByTagName('svg').length) {

    // initialize variables
    var coinsArray;
    var coins;
    var coinValues;
    var cleanValues;
    var coinData;

    d3.json("data/coins.json").then((data) => {
        // Data cleaning
        console.log(data)
        coinsArray = Object.values(data);
        console.log(coinsArray);
        coinData = Object.entries(data);

        // let bitcoinData = Object.entries(data.bitcoin);
        // loop through each array and return its second value (an array of objects)
        var getCoinsData = coinsArray.forEach(([key, value]) => {
            let coinData = () => {
                coins = Object.values(value);
                return coins;
            }
            // console.log(coinData())
            // Loop through data and find null values
            let getCoinValues = () => {
                coinData().forEach((data) => {
                    // console.log(data)
                    coinValues = Object.values(data);
                    // cleanValues = Object.values(coinValues);
                    // console.log(Object.values(coinValues))
                    // return cleanValues;

                    let entries = Object.entries(coinValues);
                    // console.log(entries)
                    entries.forEach(([key, val]) => {
                        if (val === null) {
                            // console.log(val);
                            return true;
                        } else {
                            return false;
                        }
                    })

                    // if (Object.values(data) === null) {
                    //     console.log(Object.values(data))
                    // }
                    // console.log(typeof(data))
                })
            }
            getCoinValues()
        })


        // removeNullValues = (obj) => {
        //     for (var key in obj) {
        //       if ((obj[key] ) == null) {
        //         delete obj[key];
        //       }
        //     }
        //     console.log(obj)
        //     return obj;
        //   }

        // removeNullValues(bitcoinValues);

        coins = Object.keys(data); // ["bitcoin", "bitcoin_cash", "ethereum", "litecoin", "ripple"]

        // console.log("object keys " + objectEntries);
        // let bitcoinDataObj = Object.values(data.bitcoin);
        // let bitcoinData = Object.values(bitcoinDataObj);

        const newData = coinData.forEach(([key, value]) => {
            let newVal = Object.entries(value);
            // return newVal;
            checkNulls = () => {
                newVal.forEach(([newKey, newValValue]) => {
                    // console.log(key);
                    // return Object.entries(newValue);
                    let entries = Object.entries(newValValue);

                    entries.forEach(([key, val]) => {
                        if (val === null) {
                            // console.log(val);
                            return true;
                        } else {
                            return false;
                        }
                    })

                })
            }

            nullVals = newVal.filter(entries => !checkNulls(entries));
            console.log(nullVals);
            return nullVals;
        });


        // data.forEach(function(d) {
        //     d.year = parseTime(d.year);
        //     d.value = +d.value;
        // });
    });
    console.log(
        "%c%s",
        "color: white; background: #38997D; font-size: 16px;",
        " Made by Orsolya Lukacs 🎉🚀",
        "https://github.com/orsolyalukacs"
    );
}