<template>
  <div class="home">
    <div style="height:100vh;">
      <HeroImages />
      <div class="page-container">
        <header class="page-header">
          <h1 class="title">[Session 23] Lollipops and Lost Memories</h1>
          <!-- <p class="subtitle"></p> -->
        </header>
        <div style="max-width: 1000px; text-align: left; margin: 0 auto; min-height: 100vh; color:#e0e0e0">
          <p>After an physically and emotionally exhausting rescue mission the group decides to follow Ash to her childhood hideaway in Elturel the cemetery. What was described as only a 'treehouse' turns out to feel more like a tree-mansion is comparison to what was going on in the rest of Elturel. We learned that this is where Ash and Calico had spent a lot of time in their youth 'playing house' during their fairly 'non-traditional' childhood.</p>
          <p>Once they arrive it was a good opportunity for Ada and Ash to disassociate, and emotionally unload their traumas onto Pier. Thankfully Pier is as good of a listener as he is a talker, and did his best to support his dysregulated comrades. The group decided that what everyone really needed was a drink of water and a good long nap, so they slept in the treehouse for the.. night?</p>
          <p>Through the night the group took turns taking watch. Pier went first and took the time to study the shambling undead that stood in the way of us and the Mausoleum. Pier swore that he saw something shimmering in the kitchen, and raised it with Ada during the shift change. Ada assure Pier that it was all in his head and that he had made the whole thing up and there was absolutely nothing to worry about.</p>
          <p>Once the group was well rested they hatched a plan to sneak past the zombies (which after a night of study appeared to be being 'controlled' by something or someone. Pier suspected vampires). Pier would magically turn his appearance into a that of a vampire, Ada also used her magic to appear more ghoulish, and Ash I think probably already fit the part somewhat.</p>
          <p>When the group approached the Mausoleum, they discovered an altercation between Ulder Ravenguard and a very different-looking Gideon Lightward than the one they had met in Elturel, back when it wasn’t characterized by fire and screaming. Both of them seemed to be searching for the Helm of the Gods, which conveniently we stole earlier from the cult of meanies that kidnapped Ash.</p>
          <p>The groups uses their expertly crafted disguises to sneak up on the zombies and assist Ravenguard in dispatching of Gideon. After some expertly placed Fireballs, a wombo-combo Hammer + Icebreath smack, and an absolutely tragic "Oh no! The Zombiémon broke free!" on Mike 2.0, the party came out victorious.</p>
          <p>Ash then shared with everyone that she had received a vision from the goddess Mystra, that she is destined to save Elturel from this hellscape using The Sword of Zariel. Lulu also revealed that she was the one who hid the sword in Avernus, and that she remembers where it was that she buried it, along with 2 others named Chukka and Clonk.</p>
          <p>After promising to probably save Elturel, the group enters the Mausoleum to assist Ada in locating any records they can find that would lead to answers about her past. Ash discovers a newspaper clipping that reveals that it was in-fact Ada's father, Ramos the Dragon Engine, who burned the House of Mystra to the ground. Though a letter along side it from Ash's cult-mum reveal that this destruction was orchestrated by the cult, and raises questions about why or how Ramos was involved. The letter also talks of Soul Boxes, The Vault of Scorn and a Soul Tearing ceremony, which sparks much discussion about the whereabouts of our own souls.</p>
          <p>Finally, after studying the names on the newspaper clippings, Ada recalls a memory from the day of the fire. She remembers having a human family and parents, and she remembers that she saw a young Ash on that very day being rushed out of the chapel. She also remembers, more than anything, that she really, really, REALLY wants a lollipop.</p>    
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
  max-width: 1200px;
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