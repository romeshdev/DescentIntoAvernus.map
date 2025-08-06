<template>
  <div class="toggle-container">
    <button
      :class="{ active: selectedOption === 'optionA' }"
      @click="selectOption('optionA')"
    >
      Option A
    </button>
    <button
      :class="{ active: selectedOption === 'optionB' }"
      @click="selectOption('optionB')"
    >
      Option B
    </button>
    <button
      :class="{ active: selectedOption === 'optionC' }"
      @click="selectOption('optionC')"
    >
      Option C
    </button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      selectedOption: 'optionA' // Default selected option
    };
  },
  methods: {
    selectOption(option) {
      this.selectedOption = option;
    }
  }
};
</script>

<style scoped>
.toggle-container {
  display: flex;
  gap: 5px; /* Adjust spacing between buttons */
}

.toggle-container button {
  padding: 10px 15px;
  border: 1px solid #ccc;
  background-color: #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.toggle-container button.active {
  background-color: #007bff; /* Active state background color */
  color: white; /* Active state text color */
  border-color: #007bff;
}
</style>