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
          v-for="(item, i) in game.rounds"
          :key="i"
          @click="changeRound(item, i)"
          :class="{ active: i ===  round_.active}"
        >
          <v-list-tile-avatar>
            {{item.game.split(':')[0]}}
          </v-list-tile-avatar>
          <v-list-tile-content>
            <v-list-tile-title v-text="item.game.split(':')[1]"></v-list-tile-title>
          </v-list-tile-content>
          <v-list-tile-avatar>
            <confirm-button :on-confirm="removeRound" :item="i" confirm-text="Delete?">
              <v-icon>delete</v-icon>
            </confirm-button>
          </v-list-tile-avatar>
        </v-list-tile>
      </v-list>
      <v-btn type="button" @click="newRound()">Add</v-btn>
      <form @submit.prevent="addRound" novalidate v-if="round_.show">
        <v-layout row>
          <v-flex xs6>
            <v-select
              :items="config.gameList"
              v-model="round_.game.count"
              label="game"
            ></v-select>
          </v-flex>
          <v-flex xs6>
            <v-select
              :items="config.gameType"
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
                  :items="config.bribeList"
                  v-model="round_.player[playerLen][i].count"
                  label="count"
                  required
                ></v-select>
              </v-flex>
              <v-flex xs6>
                <v-select
                  :items="config.playerType"
                  v-model="round_.player[playerLen][i].type"
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
      <v-toolbar-title>{{game.name}}</v-toolbar-title>
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
        <v-layout row wrap>
          <v-flex xs6
                  v-for="(item, i) in player"
                  :key="i"
          >
            <div>
              <b>{{game.player[i]}}</b>
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
      right
      v-model="rightDrawer"
      clipped
      persistent
    >
      <v-list>
        <v-list-tile
          v-for="(item, i) in games"
          :key="i"
          @click="changeGame(item, i)"
          :class="{ active: i ===  game_.active}"
        >
          <v-list-tile-title>{{ item.name }}</v-list-tile-title>
          <v-list-tile-avatar>
            <confirm-button :on-confirm="removeGame" :item="item" confirm-text="Delete?">
              <v-icon>delete</v-icon>
            </confirm-button>
          </v-list-tile-avatar>
        </v-list-tile>
      </v-list>
      <v-btn type="button" @click="newGame()">Add</v-btn>
      <form @submit.prevent="addGame" novalidate v-if="game_.show">
        <v-layout row>
          <v-flex xs6>
            <v-text-field
              v-model="game_.name"
              required
              label="game name"
            ></v-text-field>
          </v-flex>
          <v-flex xs6>
            <v-select
              :items="config.playerList"
              v-model="game_.players"
              label="players"
              :disabled="game_.change"
            ></v-select>
          </v-flex>
        </v-layout>
        <v-layout row wrap>
          <v-flex xs6
                  v-for="(item, i) in game_.player[game_.players]"
                  :key="i"
          >
            <v-text-field
              v-model="game_.player[game_.players][i]"
              required
              label="player"
            ></v-text-field>
          </v-flex>
        </v-layout>
        <v-layout row>
          <v-flex xs12>
            <v-btn type="submit">Set</v-btn>
          </v-flex>
        </v-layout>
      </form>
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
        config: config,

        round_: {
          game: {
            count: 6,
            type: 'game'
          },
          player: {
            3: [{}, {}, {}],
            4: [{}, {}, {}, {}]
          },
          show: false,
          active: false
        },
        game_: {
          name: 'new game',
          player: {
            3: ['','',''],
            4: ['','','','']
          },
          rounds: [],
          show: false,
          change: false,
          active: 0,
          players: 0
        }
      }
    },
    computed: {
      roundAdd: {
        get: function () {
          return {
            game: this.round_.game.count + ':' + this.round_.game.type,
            player: this.round_.player[this.playerLen].map(i => i.count + ':' + i.type)
          }
        },
        set: function (round) {
//          console.log('roundAdd', this.playerLen, round, this.game)
          let i = this.playerLen

          this.round_.game.count = parseInt(round.game.split(':')[0])
          this.round_.game.type = round.game.split(':')[1]

          while (i) {
//            console.log('1')
            i--
            this.$set(this.round_.player[this.playerLen][i], 'count', parseInt(round.player[i].split(':')[0] || 0));
            this.$set(this.round_.player[this.playerLen][i], 'type', round.player[i].split(':')[1] || '');
          }
        }
      },
      gameAdd: {
        get: function () {
          return {
            name: this.game_.name,
            player: this.game_.player[this.game_.players],
            rounds: this.game_.rounds
          }
        },
        set: function (game) {
          this.game_.name = game.name
          this.game_.player[this.game_.players] = game.player
          this.game_.rounds = game.rounds || []
        }
      },
      player () {
        let result = []
        let i = this.playerLen

        while (i) {
          result.push({
            gorka: [],
            pulja: [],
            vist: [[], [], [], []]
          })
          i--
        }

        if(this.game.rounds){
          for (let key in this.game.rounds) {
            if(this.game.rounds.hasOwnProperty(key)){
              let round  = this.game.rounds[key]
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
                // пол виста
                if(config[game].vist2){
                  setResult(result, 'vist', vistId3,
                    config[game].pulja * config[game].vist2,
                    playId)
                }

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
            }
          }
        }

        return result
      },
      game () {
        return this.games[this.game_.active]
      },
      playerLen () {
        return this.game.player.length
      }
    },
    firebase () {
      return {
        games: database.getRef('games')
//        games: {
//          source: database.getRef('games'),
//          asObject: true
//        }
      }
    },
    methods: {
      changeGame (game, i) {
//        console.log(i)
        this.newRound()
        this.game_.change = true
        this.game_.active = i
        this.setGame (game)
      },
      newGame(){
        this.game_.change = false
        this.setGame (config.gameAdd)
      },
      setGame (game) {
        this.game_.show = true
        this.game_.players = game.player.length
        this.gameAdd = game
      },
      addGame (){
        if(this.game_.change){
          this.$firebaseRefs.games.child(this.game['.key']).set(this.gameAdd)
        } else {
          this.$firebaseRefs.games.push(this.gameAdd)
        }
        this.game_.show = false
      },
      removeGame (game){
        if(this.game['.key'] !== game['.key']){
          this.$firebaseRefs.games.child(game['.key']).remove()
        }
      },


      changeRound (round, i) {
        console.log(i)
        this.round_.active = i
        this.setRound(round)
      },
      newRound(){
        this.round_.active = false
        this.setRound(config.roundAdd)
      },
      setRound (round) {
        this.round_.show = true;
        this.$nextTick(function () {
          this.roundAdd = round
        })
      },
      addRound (){
        if(this.round_.active){
          console.log(this.round_.active)
          this.$firebaseRefs.games.child(this.game['.key']).child('rounds').child(this.round_.active).set(this.roundAdd)
        } else {
          this.$firebaseRefs.games.child(this.game['.key']).child('rounds').push(this.roundAdd)
        }
        this.round_.show = false
      },
      removeRound (round){
        this.$firebaseRefs.games.child(this.game['.key']).child('rounds').child(round).remove()
      }
    }
  }
</script>

<style lang="stylus">
  @import './stylus/main'
</style>
