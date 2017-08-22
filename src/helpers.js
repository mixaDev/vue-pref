import config from './config.js'

function setResult (result, type, id, add, playId, isLast) {
  if (id > -1) {
    let a = playId !== null ? result[id][type][playId] : result[id][type]
    a.push((a[a.length - 1] || 0) + add)

    if(isLast){
      if(playId){
        result[id].last[type][playId] = true
      } else {
        result[id].last[type] = true
      }
    }
  }
}

function calculation (result){
  let pulja = result.map(i => i.pulja[i.pulja.length - 1] || 0)
  let minPulja = Math.min.apply(null, pulja)
  let pulja2 = pulja.map(i => i - minPulja)
//    console.log(pulja, minPulja, pulja2)

  let gorka = result.map((i, k) => (i.gorka[i.gorka.length - 1] || 0) - pulja2[k])
  let minGorka = Math.min.apply(null, gorka)
  let gorka2 = gorka.map(i => (i - minGorka) * 10 / gorka.length)
//    console.log(gorka, minGorka, gorka2)

  let vist = result.map(i => i.vist.map(i => i[i.length - 1] || 0))
  let vist2 = vist.map((i, id) => i.map((ii, iid) => (id !== iid) ? ii + gorka2[iid]: ii))
  let vist3 = vist2.map((i, id) => i.map((ii, iid) => (id !== iid) ? ii - vist2[iid][id]: ii))

  let calculation = vist3.map(i => i.reduce((p,c) => p+c, 0))
  calculation.forEach((i, id) => {
    result[id].calculation.push(Math.round(i))
  })
//    console.log(vist, vist2, vist3, calculation)
  return calculation
}


export const player = (rounds, playerLen) => {
  let result = []
  let i = playerLen

  while (i) {
    result.push({
      gorka: [],
      pulja: [],
      vist: playerLen === 3 ? [[], [], []] : [[], [], [], []],
      calculation: [],
      last: {
        gorka: false,
        pulja: false,
        vist: playerLen === 3 ? [false, false, false] : [false, false, false, false]
      }
    })
    i--
  }

  if(rounds){
    let last = rounds[Object.keys(rounds)[Object.keys(rounds).length - 1]]
    for (let key in rounds) {
      if(rounds.hasOwnProperty(key)){
        let round  = rounds[key]
        let game = round.game.split(':')[0]
        let gameType = round.game.split(':')[1]
        let bribe = round.player.map(i => parseInt(i.split(':')[0]))
        let role = round.player.map(i => i.split(':')[1])
        let isLast = last === round

        let playId = role.indexOf('play')
        let gameGood = bribe[playId] - game

        let vistBribe = round.player.filter(i => /vist|pas/.test(i)).reduce((p, i) => p + parseInt(i.split(':')[0]), 0)
        let vistBribe1
        let vistBribe2
        let vistId1 = role.indexOf('vist')
        let vistId2 = role.indexOf('vist', vistId1 + 1)
        let vistId3 = role.indexOf('1/2 vist')
        let vistGood = vistBribe - config[game].vist
        let vistGood1
        let vistGood2

        let handId = role.indexOf('hand')
        let handBribe = bribe[handId]

        let rozpMin = Math.min.apply(null, bribe)

        // ктото играет
        if (playId > -1) {
          // сыграная игра
          if (gameGood > -1) {
            setResult(result, 'pulja', playId, config[game].pulja, null, isLast)
            if (gameType === 'without') {
              setResult(result, 'gorka', handId, config[game].pulja, null, isLast)
            } else if (handBribe) {
              setResult(result, 'vist', handId,
                config[game].pulja * handBribe,
                playId, isLast)
            }
          }
          // не сыграная игра
          else setResult(result, 'gorka', playId, -gameGood * config[game].pulja, null, isLast)

          // вистуют двое
          if (vistId1 > -1 && vistId2 > -1) {
            vistBribe1 = bribe[vistId1]
            vistBribe2 = bribe[vistId2]
            vistGood1 = vistBribe1 - config[game].vist / 2
            vistGood2 = vistBribe2 - config[game].vist / 2
          }
          // вистует один
          else if (vistId1 > -1 || vistId2 > -1) {
            vistBribe1 = vistBribe
            vistBribe2 = vistBribe
            vistGood1 = vistGood
            vistGood2 = vistGood
          }
          setResult(result, 'vist', vistId1,
            config[game].pulja * (gameGood > -1 ? vistBribe1 : vistBribe1 - gameGood),
            playId, isLast)
          setResult(result, 'vist', vistId2,
            config[game].pulja * (gameGood > -1 ? vistBribe2 : vistBribe2 - gameGood),
            playId, isLast)
          // пол виста
          if(config[game].vist2){
            setResult(result, 'vist', vistId3,
              config[game].pulja * config[game].vist2,
              playId, isLast)
          }

          if (vistGood < 0 && vistGood1 < 0) setResult(result, 'gorka', vistId1, -vistGood1 * config[game].pulja, null, isLast)
          if (vistGood < 0 && vistGood2 < 0) setResult(result, 'gorka', vistId2, -vistGood2 * config[game].pulja, null, isLast)
        }
        // роспасы
        else {
          let id = -1
          do {
            id = bribe.indexOf(0, id + 1)
            if (id !== handId) {
              setResult(result, 'pulja', id, config[game].pulja, null, isLast)
            }
          } while (id > -1)

          bribe.forEach((i, id) => {
            let bribe = i - rozpMin
            if (bribe) {
              setResult(result, 'gorka', id, bribe * config[game].rozp, null, isLast)
            }
          })
        }
        calculation(result)
      }
    }
    result.forEach((i) => {
      return i.total = (i.calculation[i.calculation.length -1] || 0) - (i.calculation[i.calculation.length -2] || 0)
    })
  }
//        console.log(calculation(
//          [
//            {
//              gorka: [322],
//              pulja: [11],
//              vist: [[0],[120],[124]]
//            },
//            {
//              gorka: [124],
//              pulja: [11],
//              vist: [[240],[0],[154]]
//            },
//            {
//              gorka: [82],
//              pulja: [11],
//              vist: [[28],[142],[0]]
//            }
//          ]
//        ))

  return result
}
