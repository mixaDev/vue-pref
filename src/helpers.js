import config from './config.js'

export const player = (game) => {
  if(!game.player) return
  let rounds = game.rounds
  let playerLen = game.player.length
  let pulja = parseInt(game.name.split(':')[1] || 0)

  let result = []

  initResult()

  if(rounds){
    let last = rounds[Object.keys(rounds)[Object.keys(rounds).length - 1]]
    for (let key in rounds) {
      if(rounds.hasOwnProperty(key)){
        let round  = rounds[key]
        let game = parseInt(round.game.split(':')[0])
        let gameType = round.game.split(':')[1]
        let gameType2 = round.game.split(':')[2]
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
        let pasId = role.indexOf('pas')
        let vistGood = vistBribe - config[game].vist
        let vistGood1
        let vistGood2

        let handId = role.indexOf('hand')
        let handBribe = bribe[handId]

        let rozpMin = Math.min.apply(null, bribe)

        if(isLast){
          result[(handId + 1)%playerLen].hand = true
        }

        // ктото играет
        if (playId > -1) {
          // сыграная игра
          if (gameGood > -1) {
            setResult('pulja', playId, config[game].pulja, null, isLast, gameType === 'close')

            if (gameType2 === 'without') {
              setResult('gorka', handId, config[game].pulja, null, isLast)
            } else if (handBribe) {
              setResult('vist', handId,
                config[game].pulja * handBribe,
                playId, isLast)
            }
          }
          // не сыграная игра
          else {
            setResult('gorka', playId, -gameGood * config[game].pulja, null, isLast)

            // соболезнование
            setResult('vist', pasId,
              config[game].pulja * -gameGood,
              playId, isLast)
          }

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
          setResult('vist', vistId1,
            config[game].pulja * (gameGood > -1 ? vistBribe1 : vistBribe1 - gameGood),
            playId, isLast)
          setResult('vist', vistId2,
            config[game].pulja * (gameGood > -1 ? vistBribe2 : vistBribe2 - gameGood),
            playId, isLast)
          // пол виста
          if(config[game].vist2){
            setResult('vist', vistId3,
              config[game].pulja * config[game].vist2,
              playId, isLast)
          }
          // недобор вистов
          if(vistGood < 0){
            if (vistGood1 < 0) setResult('gorka', vistId1, Math.min(-vistGood,-vistGood1) * config[game].pulja, null, isLast)
            if (vistGood2 < 0) setResult('gorka', vistId2, Math.min(-vistGood,-vistGood2) * config[game].pulja, null, isLast)
          }
        }
        // роспасы
        else {
          let id = -1
          do {
            id = bribe.indexOf(0, id + 1)
            if (id !== handId) {
              setResult('pulja', id, config[game].rozp, null, isLast)
            }
          } while (id > -1)

          bribe.forEach((i, id) => {
            let bribe = i - rozpMin
            if (bribe) {
              setResult('gorka', id, bribe * config[game].rozp, null, isLast)
            }
          })
        }
        calculation()
      }
    }
    setTotal()
  }

  return result

  function initResult(){
    let i = 0

    while (i < playerLen) {
      result.push({
        id: i,
        gorka: [],
        pulja: [],
        vist: playerLen === 3 ? [[], [], []] : [[], [], [], []],
        totalGames: [],
        totalRounds: [],
        last: {
          gorka: false,
          pulja: false,
          vist: playerLen === 3 ? [false, false, false] : [false, false, false, false]
        },
        hand: false
      })
      i++
    }
  }

  function setResult (type, id, add, playId, isLast, close) {
    if (id > -1) {
      let a = playId !== null ? result[id][type][playId] : result[id][type]
      let last = a[a.length - 1] || 0
      let total = last + add
      let puljaClose = total - pulja
      if(type === 'pulja' && puljaClose > 0){
        if(last !== pulja){
          a.push(pulja)
        }
        if(close){
          setClose(result, id, puljaClose, id, isLast)
        } else {
          setResult ('gorka', id, -puljaClose, null, isLast)
        }
      } else {
        a.push(total)
      }

      if(isLast){
        if(playId!== null){
          result[id].last[type][playId] = true
        } else {
          result[id].last[type] = true
        }
      }
    }
  }

  function setClose(list, id, add, playId, isLast){
    let filter = list.filter((i) => i.id !== id)
    if(!filter.length) {
      setResult ('gorka', playId, -add, null, isLast)
      return
    }
    let item = String(Math.max.apply(null, filter.map(i => (i.pulja[i.pulja.length - 1] || 0) + '.' + i.id)))
    let minPulja = parseInt(item.split('.')[0])
    let closeId = parseInt(item.split('.')[1])
    let total = minPulja + add
    let puljaClose = total - pulja
    if(minPulja < pulja -1 && minPulja > 0){
      if(puljaClose > 0){
        setResult('vist', playId, 10 * (add - puljaClose), closeId, isLast)
        setResult('pulja', closeId, add - puljaClose, null, isLast)

        setClose(filter, closeId, puljaClose, playId, isLast)
      } else {
        setResult('vist', playId, 10 * add, closeId, isLast)
        setResult('pulja', closeId, add, null, isLast)
      }
    } else {
      setClose(filter, closeId, add, playId, isLast)
    }
  }

  function calculation (){
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
      result[id].totalGames.push(Math.round(i))
      result[id].totalRounds.push((result[id].totalGames[result[id].totalGames.length -1] || 0) - (result[id].totalGames[result[id].totalGames.length -2] || 0))
    })
  }

  function setTotal(){
    result.forEach((i) => {
      i.totalGames.reverse()
      i.totalRounds.reverse()
      i.totalGame = i.totalGames[0]
      i.totalRound = i.totalRounds[0]
    })
  }
}
