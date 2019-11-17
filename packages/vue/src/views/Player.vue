<template>
  <div class="container">
    <div class="card white">
      <div class="card-content">
        <span class="card-title">Now Playing</span>
        <p>{{ nowPlaying }}</p>
        <button class="waves-effect waves-light btn" @click="getNowPlaying()">refresh</button>
      </div>
    </div>
    <div class="row">
      <div class="col s10">
        <div class="input-field">
          <input v-model="loadTrackUrl" type="text"/>
          <label>Load track</label>
        </div>
      </div>
      <div class="col s2 load-col">
        <button class="waves-effect waves-light btn" @click="loadTrack()">Load</button>
      </div>
    </div>
    <div class="row">
      <div class="col s10">
        <div class="input-field">
          <input v-model="loadPlaylistUrl" type="text"/>
          <label>Load playlist</label>
        </div>
      </div>
      <div class="col s2 load-col">
        <button class="waves-effect waves-light btn" @click="loadPlaylist()">Load</button>
      </div>
    </div>
    <div class="row">
      <div class="col s10">
        <div class="input-field">
          <input v-model="vol" type="text"/>
          <label>Volume (0-1.0)</label>
        </div>
      </div>
      <div class="col s2 load-col">
        <button class="waves-effect waves-light btn" @click="adjustVolume()">Set</button>
      </div>
    </div>
    <div class="row">
      <div class="col s2 load-col">
        <button class="waves-effect waves-light btn" @click="pause()">Pause</button>
        <button class="waves-effect waves-light btn" @click="resume()">Resume</button>
        <button class="waves-effect waves-light btn" @click="stop()">Stop</button>
      </div>
      <div class="col s2 load-col">
        <button class="waves-effect waves-light btn" @click="next()">Next</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Toast } from 'materialize-css';

@Component({
  components: {},
})
export default class Player extends Vue {
  public nowPlaying: string = '';
  public loadTrackUrl: string = '';
  public loadPlaylistUrl: string = '';
  public vol: string = '';
  public async getNowPlaying() {
    const res = await fetch(`${this.$store.getters.getBaseUrl}/now-playing`).catch((e) => {
      this.handleError(e);
    });
    if (res) {
      const data = await res.json();
      this.nowPlaying = data.name;
      return;
    }
    this.nowPlaying = '';
  }
  public async loadTrack() {
    try {
      const res: any = await fetch(`${this.$store.getters.getBaseUrl}/load`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: this.loadTrackUrl,
        }),
      }).catch((e) => {
        this.handleError(e);
      });
      this.loadTrackUrl = '';

      if (!this.isSuccess(res)) {
        this.handleError('error');
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  public async loadPlaylist() {
    try {
      const res: any = await fetch(`${this.$store.getters.getBaseUrl}/playlist`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: this.loadPlaylistUrl,
        }),
      }).catch((e) => {
        this.handleError(e);
      });
      this.loadPlaylistUrl = '';

      if (!this.isSuccess(res)) {
        this.handleError('error');
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  public async pause() {
    try {
      const res: any = await fetch(`${this.$store.getters.getBaseUrl}/pause`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((e) => {
        this.handleError(e);
      });
      if (!this.isSuccess(res)) {
        this.handleError('error');
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  public async resume() {
    try {
      const res: any = await fetch(`${this.$store.getters.getBaseUrl}/resume`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((e) => {
        this.handleError(e);
      });
      if (!this.isSuccess(res)) {
        this.handleError('error');
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  public async stop() {
    try {
      const res: any = await fetch(`${this.$store.getters.getBaseUrl}/stop`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((e) => {
        this.handleError(e);
      });
      if (!this.isSuccess(res)) {
        this.handleError('error');
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  public async next() {
    try {
      const res: any = await fetch(`${this.$store.getters.getBaseUrl}/next`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
      }).catch((e) => {
        this.handleError(e);
      });
      if (!this.isSuccess(res)) {
        this.handleError('error');
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  public async adjustVolume() {
    try {
      const res: any = await fetch(`${this.$store.getters.getBaseUrl}/adjustVolume`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          volume: this.vol,
        }),
      }).catch((e) => {
        this.handleError(e);
      });
      if (!this.isSuccess(res)) {
        this.handleError('error');
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  private handleError(err: any) {
    M.toast({html: err});
  }

  private isSuccess(res: any) {
    if (res.status === 200) {
      return true;
    }
    return false;
  }
}
</script>
<style lang="scss">
.row {
  display: flex;
}
.load-col {
  margin: auto;
  
  button {
    margin: 10px 5px;
  }
}
</style>
