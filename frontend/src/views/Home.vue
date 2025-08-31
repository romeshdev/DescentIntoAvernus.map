<template>
  <div class="home">
    <div style="height:100vh;">
      <HeroImages />
      <h2 style="padding: 20px">Previously: [Session 22] Ashes to ashes... or not!</h2>
      <div style="max-width: 1000px; text-align: left; margin: 0 auto; min-height: 100vh; color:#e0e0e0">
        <p>The gang awakens to discover that Ash is missing, presumably having gone off to chase a cat. They head off in search of her, finding one guard who saw a cat-chasing goth leave the perimeter. Outside the walls, Ada is able to find signs of struggle and of poison - nobody knows where they lead though.</p>
        <p>At this point old mate the vrock flies down and offers information about the disappeared Ash in exchange for suffering, which gun dog inflict on Ada with his flamethrower. The cackling vrock reveals that Ash has been taken to the grand cemetery, to the chapel of Mystra (goddess of magic). </p>
        <p>Entering the cemetery, Ada gets the strange feeling that she's been here before: this was the place she lost her limbs. It was a fire it seems, caused by dragon cultists. Meanwhile PC find the grave of Mathieu "The Coward" and leaves his Eltuguard banner on it, covering up the insulting inscription.</p>
        <p>Arriving at the chapel, it's Ari's turn to feel uncomfortable : she too has been here before. This place has something to do with the damning of her family, so with the pact that was made to save her life. Inside, broken stained-glass windows depict the paladin Lanish Fogel with the Helmet of the Gods - knowing Ravenguard is looking for an artifact here, the gang put two and two together : he's looking for this specific helmet.</p>
        <p>Sadly, the chapel appears to be a front for the Cult of the Dead Three : in the catacombs beneath it, they have gathered around their "dark angel weapon", Ash, and are making ready to sacrifice her. See, this is what happens when you don't go to therapy.</p>
        <p>Ada is able to whisk Ash out of danger using her magic arm, and it is revealed that Ash is wearing the helmet! A fight ensues, and while most of the goombahs are incinerated with dwarf-like alacrity, the two big bads manage to wade in and down Ada twice, with Ari only being saved because her entire body is made of arcane wards. Ash's cult-mummy, in particular, steps on everyone.</p>
        <p>Ash is able to resist domination, however, and eventually eviscerates her disappointed cult-mum. As the dust settles, the assassin Calico emerges from hiding and exchanges a few sexy words with Ash. Much lip-biting ensues, with each claiming that the other betrayed them. It is revealed that Calico had been a spy for "Z" (probably Zariel) in the Dead Three cult, and that Ash had heard that he was going to betray them, so had betrayed him first. Calico then egresses in the most emo way possible, sighing sadly to Ash's "I don't want to lose you again", saying "you never had me", and leaping out of a window with a tear in his eye. He drops a button on the way, however, that matches the one Ari has from her brother's coat. So either Calico is hunting Ari's brother or... no... they couldn't be the same person... surely?</p>
        <p>Everyone is now in the foetal position except for PC, who manages to marshal the troops and get them upstairs. At this point, with undead shapes visible in the distance, PC joins the others in the foetal position. Ada wants to find records about the chapel, as she can't remember what caused the fire. PC only knows that it was a dragon cult attack, but tries to direct the party away from the undead and the grand mausoleum. The others agree that this is the likeliest place to find paperwork about the chapel though, so begin making their way in that direction - planning to stop at a treehouse that Ash and Calico used to hang out in during their fun -literally a death cult- childhood. </p>
      </div>
    </div>
  </div>
</template>
<script>
import HelloWorld from '../components/HelloWorld.vue'
import HeroImages from '../components/HeroImages.vue'
import { useAuthStore } from '../store/auth'
import { computed } from 'vue'

export default {
  name: 'Home',
  components: {
    HelloWorld,
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