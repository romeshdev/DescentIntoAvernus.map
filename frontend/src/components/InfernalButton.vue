<template>
  <button class="infernal-button" 
    @click="handleClick"
    :class="buttonClasses"
    :disabled="disabled"
    :type="type">
    <slot></slot>
  </button>
</template>
<script>
export default {
  name: 'InfernalButton',
    props: {
    // For router navigation
    to: {
      type: [String, Object],
      default: null
    },
    // Custom click handler
    onClick: {
      type: Function,
      default: null
    },
    // Button styling
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'danger', 'ghost'].includes(value)
    },
    size: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'button'
    },
    // Router options
    replace: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    handleClick(event) {
      if (this.disabled) return
      
      // If there's a custom onClick handler, call it first
      if (this.onClick) {
        const result = this.onClick(event)
        // If onClick returns false, don't proceed with navigation
        if (result === false) return
      }
      
      // Handle router navigation
      if (this.to && this.$router) {
        if (this.replace) {
          this.$router.replace(this.to)
        } else {
          this.$router.push(this.to)
        }
      }
    }
  }
}
</script>
<style scoped>
.infernal-button {
  font-family: "MedievalSharp", cursive;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background-image: url("../buttons/button.png");
  color: #fff;
  width: 160px;
  height: 45px;
  text-align: center;
  padding: 10px 20px;
  text-decoration: none;
  font-size: 14px;
  background-size: contain;
  background-repeat: no-repeat;
  user-select: none;
  text-transform: capitalize;  
  background-color: transparent;
  border: none;
}

.infernal-button:hover {
  color: #fff;
  background-image: url("../buttons/button3.png");
  outline: none;
}

.infernal-button:focus {
  outline: none;
  background-image: url("../buttons/button2.png");
}

.floating {
  position: absolute;
  bottom: 20px;
  right: 20px;
}
.floating-2 {
  position: absolute;
  bottom: 110px;
  right: 20px;
}
.floating-3 {
  position: absolute;
  bottom: 200px;
  right: 20px;
}

.floating-4 {
  position: absolute;
  bottom: 290px;
  right: 20px;
}

.floating-5 {
  position: absolute;
  bottom: 380px;
  right: 20px;
}

</style>