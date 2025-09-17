<template>
  <div class="image-container">
    <!-- <img :src="avernusBanner" /> -->
    <div 
      v-for="image in images" 
      :key="image.name"
      class="circular-image-wrapper"
    >
      <img 
        :src="image.src" 
        :alt="image.name"
        class="circular-image"
      />
      <img 
        :src="borderImage" 
        alt="border"
        class="border-overlay-image"
      />
      <!-- <div class="image-label">{{ image.name }}</div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeroImages',
  data() {
    return {
      borderImage: '/players/border.png', // Replace with your border image path
      avernusBanner: '/banners/avernus-banner.jpeg',
      images: [
        {
          name: 'Ash',
          src: '/players/ash.jpg'
        },
        {
          name: 'Ari',
          src: '/players/ari.png'
        },
        {
          name: 'Pier',
          src: '/players/pier.png'
        },
        {
          name: 'Ada',
          src: '/players/ada.png'
        }
      ]
    }
  }
}
</script>

<style scoped>
.image-container {
  display: flex;
  gap: 100px;
  padding-bottom: 70px;
  height: 230px;
  margin-top: -2rem;
  justify-content: center;
  align-items: center;
  background-image: url(/banners/avernus-banner.jpeg);
  background-repeat: no-repeat;
  background-position: center;
}

.circular-image-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  transition: transform 0.3s ease;
}

.circular-image-wrapper:hover {
  transform: scale(1.05);
}

.border-overlay-image {
  position: absolute;
  top: -2px;
  left: -2px;
  width: 155%;
  height: 155%;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.circular-image {
  width: 150%;
  height: 150%;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.border-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid transparent;
  background: linear-gradient(45deg, 
    rgba(255, 255, 255, 0.8) 0%, 
    rgba(255, 255, 255, 0.1) 25%, 
    rgba(255, 255, 255, 0.3) 50%, 
    rgba(255, 255, 255, 0.1) 75%, 
    rgba(255, 255, 255, 0.8) 100%);
  background-clip: padding-box;
  pointer-events: none;
  animation: shimmer 3s ease-in-out infinite;
}

.border-overlay::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(45deg, 
    rgba(255, 255, 255, 0.8), 
    rgba(255, 255, 255, 0.2), 
    rgba(255, 255, 255, 0.5), 
    rgba(255, 255, 255, 0.2), 
    rgba(255, 255, 255, 0.8));
  border-radius: 50%;
  z-index: -1;
}

.image-label {
  text-align: center;
  margin-top: 10px;
  color: #ffffff;
  font-weight: 600;
  font-size: 14px;
}

@keyframes shimmer {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@media (max-width: 600px) {
  .image-container {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .circular-image-wrapper {
    width: 100px;
    height: 100px;
  }
}
</style>