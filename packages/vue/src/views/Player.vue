<template>
  <div class="container">
    <div class="card white">
      <div class="card-content">
        <span class="card-title">Now Playing</span>
        <p>{{ nowPlaying }}</p>
      </div>
    </div>
    <div class="row">
      <div class="col s10">
        <div class="input-field">
          <input v-model="loadTrackUrl" id="load-track" type="text"/>
          <label for="load-track">Load track</label>
        </div>
      </div>
      <div class="col s2 load-col">
        <button class="waves-effect waves-light btn" @click="loadTrack()">Load</button>
      </div>
    </div>
    <div class="row">
      <div class="col s2 load-col">
        <button class="waves-effect waves-light btn">Pause</button>
      </div>
      <div class="col s2 load-col">
        <button class="waves-effect waves-light btn">Resume</button>
      </div>
      <div class="col s2 load-col">
        <button class="waves-effect waves-light btn">Next</button>
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
export default class Home extends Vue {
  public nowPlaying: string = '';
  public loadTrackUrl: string = '';
  public async getNowPlaying() {
    const res = await fetch(`${this.$store.getters.getBaseUrl}/now-playing`);
    const data = await res.json();
    this.nowPlaying = data.name;
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

      if (!this.isSuccess(res.status)) {
        this.handleError('error loading track');
      }
    } catch (e) {
      this.handleError(e);
    }
  }

  private handleError(err: any) {
    M.toast({html: err});
  }

  private isSuccess(status: number) {
    if (status === 200) {
      return true;
    }
  }
}
</script>
<style lang="scss">
.row {
  display: flex;
}
.load-col {
  margin: auto;
}
</style>
