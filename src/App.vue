<template>
  <v-app light v-if="games && game">
    <v-navigation-drawer
      persistent
      :mini-variant="miniVariant"
      v-model="drawer"
      enable-resize-watcher
    >
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in game.list"
          :key="i"
          @click="setRound(item)"
        >
          <v-list-tile-content>
            <v-list-tile-title v-text="item.game"></v-list-tile-title>
          </v-list-tile-content>
        </v-list-tile>
      </v-list>
      <v-btn type="submit" @click="setRound(config.round)">Add</v-btn>
      <form @submit.prevent="addRound" novalidate>
        <v-layout row>
          <v-flex xs6>
            <v-select
              v-bind:items="config.gameList"
              v-model="round_.game.count"
              label="game"
            ></v-select>
          </v-flex>
          <v-flex xs6>
            <v-select
              v-bind:items="config.gameType"
              v-model="round_.game.type"
              label="type"
            ></v-select>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs6
                  v-for="(item, i) in game.player"
                  :key="i"
          >
            {{item}}
            <v-layout row>
              <v-flex xs6>
                <v-select
                  v-bind:items="config.bribeList"
                  v-model="round_.player[i].count"
                  label="count"
                  required
                ></v-select>
              </v-flex>
              <v-flex xs6>
                <v-select
                  v-bind:items="config.playerType"
                  v-model="round_.player[i].type"
                  label="type"
                  required
                ></v-select>
              </v-flex>
            </v-layout>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs12>
            <v-btn type="submit">Set</v-btn>
          </v-flex>
        </v-layout>
      </form>
    </v-navigation-drawer>
    <v-toolbar fixed>
      <v-toolbar-side-icon @click.stop="drawer = !drawer" light></v-toolbar-side-icon>
      <v-btn
        icon
        light
        @click.stop="miniVariant = !miniVariant"
      >
        <v-icon v-html="miniVariant ? 'chevron_right' : 'chevron_left'"></v-icon>
      </v-btn>
      <v-toolbar-title v-text="game.name"></v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        icon
        light
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>menu</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <v-container fluid>
        <v-layout row>
          <v-flex xs6
                  v-for="(item, i) in player"
                  :key="i"
          >
            <div>
              <input type="text"
                     :value="game.player[i]"
                     @input="renamePlayer(i, $event.target.value)"
              >
            </div>
            <div>{{item.gorka}}</div>
            <div>{{item.pulja}}</div>
            <div>{{item.vist}}</div>
            <!--<div-->
            <!--v-for="(item, i) in item.vist"-->
            <!--&gt;{{item}}-->
            <!--</div>-->
          </v-flex>
        </v-layout>

      </v-container>
    </main>
    <v-navigation-drawer
      temporary
      right
      v-model="rightDrawer"
    >
      <v-list>
        <v-list-tile
          v-for="(item, i) in games"
          :key="i"
          @click="changeGame(i)"
        >
          <v-list-tile-title>{{ item.name }}</v-list-tile-title>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
  import database from './database.js'
  import config from './config.js'

  function setResult (result, type, id, add, playId) {
    if (id > -1) {
      let a = playId !== undefined ? result[id][type][playId] : result[id][type]
      a.push((a[a.length - 1] || 0) + add)
    }
  }

  export default {
    data () {
      return {
        drawer: true,
        miniVariant: false,
        rightDrawer: false,
        gameActive: 0,
        config: config,
        round_: config.round
      }
    },
    computed: {
      round: {
        get: function () {
          return {
            game: this.round_.game.count + ':' + this.round_.game.type,
            player: this.round_.player.map(i => i.count + ':' + i.type)
          }
        },
        set: function (round) {
          let i = config.players

          this.round_.game.count = parseInt(round.game.split(':')[0])
          this.round_.game.type = round.game.split(':')[1]

          while (i) {
            i--
            this.$set(this.round_.player[i], 'count', parseInt(round.player[i].split(':')[0]));
            this.$set(this.round_.player[i], 'type', round.player[i].split(':')[1]);
//            this.round_.player[i].count = parseInt(round.player[i].split(':')[0])
//            this.round_.player[i].type = round.player[i].split(':')[1]
          }
        }
      },
      player () {
        let result = []
        let players = config.players

        while (players) {
          result.push({
            gorka: [],
            pulja: [],
            vist: [[], [], [], []]
          })
          players--
        }
        console.log(this.game.list)
        this.game.list.forEach(function (round) {
          let game = round.game.split(':')[0]
          let gameType = round.game.split(':')[1]
          let bribe = round.player.map(i => parseInt(i.split(':')[0]))
          let role = round.player.map(i => i.split(':')[1])

          let playId = role.indexOf('play')
          let gameGood = bribe[playId] - game

          let vistBribe = round.player.filter(i => /vist|pas/.test(i)).reduce((p, i) => p + parseInt(i.split(':')[0]), 0)
          let vistBribe1
          let vistBribe2
          let vistId1 = role.indexOf('vist')
          let vistId2 = role.indexOf('vist', vistId1 + 1)
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
              setResult(result, 'pulja', playId, config[game].pulja)
              if (gameType === 'without') {
                setResult(result, 'gorka', handId, config[game].pulja)
              } else if (handBribe) {
                setResult(result, 'vist', handId,
                  config[game].pulja * handBribe,
                  playId)
              }
            }
            // не сыграная игра
            else setResult(result, 'gorka', playId, -gameGood * config[game].pulja)

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
              playId)
            setResult(result, 'vist', vistId2,
              config[game].pulja * (gameGood > -1 ? vistBribe2 : vistBribe2 - gameGood),
              playId)

            if (vistGood < 0 && vistGood1 < 0) setResult(result, 'gorka', vistId1, -vistGood1 * config[game].pulja)
            if (vistGood < 0 && vistGood2 < 0) setResult(result, 'gorka', vistId2, -vistGood2 * config[game].pulja)
          }
          // роспасы
          else {
            let id = -1
            do {
              id = bribe.indexOf(0, id + 1)
              if (id !== handId) {
                setResult(result, 'pulja', id, config[game].pulja)
              }
            } while (id > -1)

            bribe.forEach((i, id) => {
              let bribe = i - rozpMin
              if (bribe) {
                setResult(result, 'gorka', id, bribe * config[game].rozp)
              }
            })
          }
        })
        return result
      },
      game () {
        return this.games[this.gameActive]
      }
    },
    firebase () {
      return {
        games: database.getRef('games')
      }
    },
    methods: {
      changeGame (i) {
        this.gameActive = i
      },
      renamePlayer (i, newText) {
        this.$firebaseRefs.games.child(this.gameActive).child('player').child(i).set(newText)
      },
      addRound (){
        this.$firebaseRefs.games.child(this.gameActive).child('list').push(this.round)
      },
      setRound (round) {
        this.round = round
      }
    }
  }
</script>

<style lang="stylus">
  @import './stylus/main'
</style>
