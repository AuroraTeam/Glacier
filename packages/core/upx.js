const UPX = require('upx')(best = true) // see options below

UPX('example.exe')
.output('main.exe')
.start().then(function(stats){
  console.log(stats)
}).catch(function (err) {
  console.log(err)
})