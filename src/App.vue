<template>
  <v-app dark toolbar v-if="games && game">
    <v-navigation-drawer
      persistent
      v-model="drawer"
      enable-resize-watcher
    >
      <v-toolbar>
        <v-toolbar-title>Round List</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click.native.stop="newRound()"
          icon
        >
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-dialog v-model="round_.show" fullscreen transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar>
            <v-btn icon @click.native.stop="closeRound()">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Round {{round_.active ? 'Edit' : 'Add'}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn flat @click.native.stop="addRound()">Save</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text>
            <v-layout row>
              <v-flex xs4>
                <v-select
                  :items="config.gameList"
                  v-model="round_.game.count"
                  label="game"
                ></v-select>
              </v-flex>
              <v-flex xs4>
                <v-select
                  :items="config.gameType"
                  v-model="round_.game.type"
                  label="type"
                ></v-select>
              </v-flex>
              <v-flex xs4>
                <v-select
                  :items="config.gameType2"
                  v-model="round_.game.type2"
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
        <template v-for="(item, i, index) in game.rounds">
          <v-list-tile
            :key="i"
            @click.native.stop="editRound(item, i)"
            :class="{ active: i ===  round_.active}"
          >
            <v-list-tile-avatar>
              <v-btn fab secondary small>
                {{item.game.split(':')[0]}}
              </v-btn>
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>{{item.game.split(':')[1]}}<span v-if="item.game.split(':')[2]"> / {{item.game.split(':')[2]}}</span></v-list-tile-title>
              <v-list-tile-sub-title>
                <v-layout row wrap text-xs-center>
                  <v-flex xs3 v-for="(item, i) in player" :key="i">
                    <div :class="{'green lighten-2': item.totalRounds[index] > 0, 'red lighten-2': item.totalRounds[index] < 0}">
                      {{item.totalRounds[index]}}/{{item.totalGames[index]}}
                    </div>
                  </v-flex>
                </v-layout>
              </v-list-tile-sub-title>
            </v-list-tile-content>
            <v-list-tile-action>
              <confirm-button :on-confirm="removeRound" :item="i" confirm-text="Delete?">
                <v-icon>delete</v-icon>
              </confirm-button>
            </v-list-tile-action>
          </v-list-tile>
          <v-divider inset></v-divider>
        </template>

      </v-list>
    </v-navigation-drawer>
    <v-toolbar fixed>
      <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
      <v-toolbar-title>{{game.name}}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        icon
        @click.stop="rightDrawer = !rightDrawer"
      >
        <v-icon>view_module</v-icon>
      </v-btn>
    </v-toolbar>
    <main>
      <v-container fluid>
        <v-layout row wrap>
          <v-flex xs6
                  v-for="(item, i) in player"
                  :key="i"
                  :class="['order-xs' + config.order[i]]"
          >
            <v-toolbar :class="{'theme--light': item.hand}">
              <v-chip small :class="['white--text',{'green': item.totalGame > 0, 'red': item.totalGame < 0}]">
                {{item.totalGame}}
              </v-chip>
              <v-spacer></v-spacer>
              <div class="title">{{game.player[i]}}</div>
              <v-spacer></v-spacer>
              <v-chip small :class="['white--text',{'green': item.totalRound > 0, 'red': item.totalRound < 0}]">
                {{item.totalRound}}
              </v-chip>
            </v-toolbar>
            <div>
              g
              <span :class="{'blue': item.last.gorka && (i === item.gorka.length - 1)}"
                    v-for="(g, i) in item.gorka"
              >{{g}}.</span>
            </div>
            <div>
              p
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
          </v-flex>
        </v-layout>
      </v-container>
    </main>
    <v-navigation-drawer
      right
      v-model="rightDrawer"
      temporary
    >
      <v-toolbar>
        <v-toolbar-title>Game List</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          @click.native.stop="newGame()"
          icon
        >
          <v-icon>add</v-icon>
        </v-btn>
      </v-toolbar>
      <v-dialog v-model="game_.show" fullscreen transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar>
            <v-btn icon @click.native.stop="closeGame()">
              <v-icon>close</v-icon>
            </v-btn>
            <v-toolbar-title>Game {{game_.change ? 'Edit' : 'Add'}}</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-toolbar-items>
              <v-btn flat @click.native.stop="addGame()">Save</v-btn>
            </v-toolbar-items>
          </v-toolbar>
          <v-card-text>
            <v-layout row>
              <v-flex xs6>
                <v-text-field
                  v-model="game_.name.name"
                  label="game name"
                ></v-text-field>
              </v-flex>
              <v-flex xs6>
                <v-select
                  :items="config.puljaList"
                  v-model="game_.name.pulja"
                  label="pulja"
                ></v-select>
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
                      :class="['order-xs' + config.order[i]]"
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
        <template v-for="(item, i) in games">
          <v-list-tile
            :key="i"
            @click="changeGame(item, i)"
            :class="{ active: i ===  game_.active}"
          >
            <v-list-tile-title>{{ item.name.split(':')[0] }}</v-list-tile-title>
            <v-list-tile-avatar>
              <span>{{ item.name.split(':')[1] }}</span>
              <span @click.stop="editGame(item, i)"><v-icon>mode_edit</v-icon></span>
              <confirm-button :on-confirm="removeGame" :item="item" confirm-text="Delete?">
                <v-icon>delete</v-icon>
              </confirm-button>
            </v-list-tile-avatar>
          </v-list-tile>
          <v-divider></v-divider>
        </template>
      </v-list>
    </v-navigation-drawer>
  </v-app>
</template>

<script src="./app.js"></script>

<style lang="stylus">
  @import './stylus/main'
</style>
