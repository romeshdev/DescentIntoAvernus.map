<template>
  <div class="home">
    <div style="height:100vh;">
      <HeroImages />
      <div class="page-container">
        <header class="page-header">
          <h1 class="title">[Session 24] What's brown and Styxy?</h1>
          <!-- <p class="subtitle"></p> -->
        </header>
        <div style="max-width: 1000px; text-align: left; margin: 0 auto; min-height: 100vh; color:#e0e0e0">
          <p>Landing on the surface of Avernus (or into the Styx in Pierre's case) the gang is confronted by a posse of stinky demons. Ash seems to have become extremely paranoid, Pierre thinks that he has to martyr himself ("witness me!"), and Ari is nowhere to be seen.</P>
          <p>Somehow the demons are dispatched in spite of all this, though Lulu goes down and PC hurls himself into the Styx a second time, promptly becomes as paranoid as Ash and running off into the boonies.</P>
          <p>Despite all this dysfunction, the team are able to move away from the front lines and into a safe (ish) canyon where they camp. They are awoken by a disembodied heartbeat coming from a disembodied heart - "disembodied" in the sense that it has been removed from its body and left as a gift. But it's still beating. Creepy. Hopefully it isn't Ari's.</P>
          <p>Setting off, Ash struggles to decide whether she is affected by a curse that is causing her to be paranoid, or whether that's just the paranoia talking. She decides not to risk casting lesser restoration on herself, just in case that's what "they" want her to do. Meanwhile Pierre channels Donald Trump and then an excited 6 year old, and Ari is still AWOL, leaving Ada to be the adult in the room. Progress towards Fort Knucklebone is nonetheless made.</P>
          <p>At last arriving on a sort of salt flat, the team witnesses ("WITNESSED!") a fight between speed-demon devils driving hellish machines and demons getting run over by them. One of the machines crashes nearby and the gang are able to dispatch the pilot, but not before he/she/it warns them about "the red man" - it's the most wonderful time of the year (aka "oh what a day, what a lovely day!")</P>
          <p>The wreck cannot be salvaged but the team does find a mysterious chest with no obvious opening mechanism. They flee with it as demons arrive to claim the wreck...</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import HeroImages from '../components/HeroImages.vue'
import { useAuthStore } from '../store/auth'
import { computed } from 'vue'

export default {
  name: 'Home',
  components: {
    HeroImages
  },
  setup() {
    const authStore = useAuthStore()
    
    return {
      isAuthenticated: computed(() => authStore.isAuthenticated),
      user: computed(() => authStore.user)
    }
  }
}
</script>
<style scoped>

.title {
  font-size: 3rem;
  font-weight: bold;
  color: #ff6b35;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
  margin-top: 0px;
}

.subtitle {
  font-size: 1.2rem;
  color: #cccccc;
  margin: 0;
}

.page-header {
  text-align: center;
  /* margin-bottom: 3rem; */
}

.page-container {
  max-width: 1292.4px;
  margin: 0 auto;
  padding: 2rem;
  background: #1a1a1a;
  /* border-radius: 15px; */
  min-height: 100vh;
  color: #e0e0e0;
}

.home {
  text-align: center;
}

header {
  margin-bottom: 2rem;
}

.auth-section {
  margin-top: 3rem;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.auth-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.demo-info {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #6c757d;
}

.welcome-message h3 {
  margin-bottom: 1rem;
  color: #28a745;
}
</style>