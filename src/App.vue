<template>
  <v-app light v-if="games && game">
    <v-navigation-drawer
      persistent
      v-model="drawer"
      enable-resize-watcher
    >
      <v-toolbar dark>
        <v-toolbar-title>Round List</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark flat @click.native.stop="newRound()">Add</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-dialog v-model="round_.show" fullscreen transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar dark>
            <v-btn icon @click.native.stop="closeRound()" dark>
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Round {{round_.active ? 'Edit' : 'Add'}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark flat @click.native.stop="addRound()">Save</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text>
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
                    ></v-select>
                  </v-flex>
                  <v-flex xs6>
                    <v-select
                      :items="config.playerType"
                      v-model="round_.player[playerLen][i].type"
                      label="type"
                    ></v-select>
                  </v-flex>
                </v-layout>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-list>
        <v-list-tile
          value="true"
          v-for="(item, i) in game.rounds"
          :key="i"
          @click.native.stop="editRound(item, i)"
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
    </v-navigation-drawer>
    <v-toolbar dark fixed>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
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
            <v-card>
              <div>
                <b>{{game.player[i]}}</b>
              </div>
              <div>
                 <span :class="{'blue': item.last.gorka && (i === item.gorka.length - 1)}"
                       v-for="(g, i) in item.gorka"
                 >{{g}}.</span>
              </div>
              <div>
                <span :class="{'blue': item.last.pulja && (i === item.pulja.length - 1)}"
                     v-for="(p, i) in item.pulja"
                >{{p}}.</span>
              </div>
              <div
                v-for="(vist, ii) in item.vist"
                v-if="i !== ii"
              >
                <b>{{game.player[ii]}}</b>
                <span :class="{'blue': item.last.vist[ii] && (iii === vist.length - 1)}"
                      v-for="(v, iii) in vist"
                >{{v}}.</span>
              </div>
              <div>{{item.calculation}}</div>
              <div>
                <v-icon class="green" v-if="item.total > 0">arrow_drop_up</v-icon>
                <v-icon class="red" v-if="item.total < 0">arrow_drop_down</v-icon>
                {{item.total}}
              </div>
            </v-card>
          </v-flex>
        </v-layout>

      </v-container>
    </main>
    <v-navigation-drawer
      right
      v-model="rightDrawer"
      temporary
    >
      <v-toolbar dark>
        <v-toolbar-title>Game List</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn dark flat @click.native.stop="newGame()">Add</v-btn>
        </v-toolbar-items>
      </v-toolbar>
      <v-dialog v-model="game_.show" fullscreen transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar dark>
            <v-btn icon @click.native.stop="closeGame()" dark>
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Game {{game_.change ? 'Edit' : 'Add'}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn dark flat @click.native.stop="addGame()">Save</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text>
            <v-layout row>
              <v-flex xs6>
                <v-text-field
                  v-model="game_.name"
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
                  label="player"
                ></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
        </v-card>
      </v-dialog>
      <v-list>
        <v-list-tile
          v-for="(item, i) in games"
          :key="i"
          @click="changeGame(item, i)"
          :class="{ active: i ===  game_.active}"
        >
          <v-list-tile-title>{{ item.name }}</v-list-tile-title>
          <v-list-tile-avatar>
            <span @click.stop="editGame(item, i)"><v-icon>mode_edit</v-icon></span>
            <confirm-button :on-confirm="removeGame" :item="item" confirm-text="Delete?">
              <v-icon>delete</v-icon>
            </confirm-button>
          </v-list-tile-avatar>
        </v-list-tile>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script>
  import database from './database.js'
  import config from './config.js'
  import { player } from './helpers.js'

  export default {
    data () {
      return {
        drawer: true,
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
          let i = this.playerLen

          this.round_.game.count = parseInt(round.game.split(':')[0])
          this.round_.game.type = round.game.split(':')[1]

          while (i) {
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
        return player(this.game.rounds, this.playerLen)
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
      }
    },
    methods: {
      changeGame (game, i) {
        this.game_.active = i
        this.setGame (game)
      },
      editGame (game, i) {
        this.game_.show = true
        this.game_.change = true
        this.game_.active = i
        this.setGame (game)
      },
      newGame(){
        this.game_.show = true
        this.game_.change = false
        this.setGame (config.gameAdd)
      },
      setGame (game) {
        this.rightDrawer = false
        this.game_.players = game.player.length
        this.gameAdd = game
      },
      closeGame() {
        this.game_.show = false
        this.rightDrawer = true
      },
      addGame (){
        if(this.game_.change){
          this.$firebaseRefs.games.child(this.game['.key']).set(this.gameAdd)
        } else {
          this.$firebaseRefs.games.push(this.gameAdd)
        }
        this.closeGame()
      },
      removeGame (game){
        if(this.game['.key'] !== game['.key']){
          this.$firebaseRefs.games.child(game['.key']).remove()
        }
      },

      editRound (round, i) {
        this.round_.active = i
        this.setRound(round)
      },
      newRound(){
        this.round_.active = false
        this.setRound(config.roundAdd)
      },
      setRound (round) {
        this.round_.show = true;
        this.drawer = false
        this.$nextTick(function () {
          this.roundAdd = round
        })
      },
      closeRound () {
        this.round_.show = false
        this.drawer = true
      },
      addRound (){
        if(this.round_.active){
          this.$firebaseRefs.games.child(this.game['.key']).child('rounds').child(this.round_.active).set(this.roundAdd)
        } else {
          this.$firebaseRefs.games.child(this.game['.key']).child('rounds').push(this.roundAdd)
        }
        this.closeRound()
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
