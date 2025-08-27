<template>
  <div class="home">
    <div style="height:100vh;">
      <HeroImages />
      <h2 style="padding: 20px">Previously: [Session 21] Trauma Everywhere All At Once</h2>
      <div style="max-width: 800px; text-align: left; margin: 0 auto; min-height: 100vh; color:#e0e0e0">
        <p>
          Crawling through a tunnel after rat-Ada, the gang find themselves alone in a spooky theatre. A spooky jester appears and starts taunting Pierre-Charlotte, asking him to take on the role of Romeo in a play featuring Reya as Juliet. PC isn't having any of it: Reya is clearly a puppet. PC tries to strike at the jester, who disappears. A fight ensues against puppet Juliet and puppet Romeo, with the puppets alternately terrifying and seducing Ari. Speaking of which, here's a brief recap of the party's romantic tastes, as established by precedent:
          <ul>
            <li>Ari: puppets</li>
            <li>Ash: hotboi pirate orcs and psychopathic killers (I can fix him)</li>
            <li>Pierre-Charlotte: his exact relationship with Reya remains somewhat unclear to the party</li>
            <li>Ada: too focused on gold for romance?</li>
          </ul>
        </p>
        <p>But I digress. PC forgets how concentration works, falls 60 feet onto his head and is knocked unconscious. Ash now has two attacks, so more or less carries the team until rat-Ada gnaws through the ropes to drop a piece of scenery of Juliet, ending the fight. </p>

        <p>PC has a vision of Mathieu, his ancestor, destroying the portal to Avernus using a shield that seems to be the one PC has inherited. He then finds himself trapped in a room with just his reflexion, and realises that he is the jester! Pierre-Charlotte suffers emotional damage. He punches the mirror and escapes, finding himself with the rest of the party and the refugees at the foot of High Hall, but still with bloody hands. It's unclear whether what just happened was real or not: some Fey memory-altering shenanigans may have occurred. </p>

        <p>The gang is able to follow the clues in their deciphered note. They take a leap of faith off the cliff in front of them, alighting on some invisible stairs. The stairs lead them to a secret camp where the refugees are safely deposited (I wonder what happened to those ungrateful dwarves though). Ari tries to comfort PC by explaining spell-transcription to him. Rat-Ada wanders off and nearly gets eaten by a Kobold dragon-cultist. </p>
        <p>Ada stops being a rar to rebuke the kobold. The kobold claims to be a servant of Arkon the Cruel, who is at the head of an army to the north and who has been attempting to hunt / recruit / convert the dragon Ramos, who is Ada's "dad". Apparently he has succeeded, and Ramos is on his way to meet Arkon. Together, they will free Tiamat, the infernal god of chromatic dragons. Bad juju. Ada is able to pretend that she is unphaased and not a dragon, then turns back into a rat again.</p>

        <p>Meanwhile Ash sees that cat again and wanders off after it. But the cat turns out to actually be a hotboi assassin from Ash's past! Ash is able to resist his sexy taunting, but not the repeated stabbing with a poisoned sword (her old sword, apparently). Ash falls unconscious - oh no!</p>
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