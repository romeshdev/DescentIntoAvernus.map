<!-- components/MapControls.vue -->
<template>
  <v-toolbar density="compact" class="page-layout" color="grey-darken-4">
    
    <v-icon icon="mdi-filter" start end></v-icon>
    <v-btn-toggle v-model="nodeFilter" rounded="0" group>
      <v-btn value="all">All</v-btn>
      <v-btn value="recaps">Session Recaps</v-btn>
      <v-btn value="poi">Points of Interest</v-btn>
    </v-btn-toggle> 
    <v-toolbar-title text=""></v-toolbar-title>

    <v-btn icon="mdi-dots-vertical" size="small" variant="elevated">
      <v-icon></v-icon>
      <v-speed-dial activator="parent" location="bottom center" open-on-hover>
          
          <v-btn icon="mdi-map-marker" size="small" v-tooltip:bottom="'Map Markers'">
            <v-icon></v-icon>
            <v-speed-dial activator="parent" location="left center" transition="scale-transition" open-on-hover>
              <v-btn v-for="(item, i) in filterEditActions('poi')" :key="i" v-tooltip:bottom="item.tooltip" icon="" @click="handleEditAction(item)">
                <v-icon>{{item.icon}}</v-icon>
                <v-icon size="15" class="position-absolute" style="bottom: 0; right: 0;">{{item.editIcon}}</v-icon>
              </v-btn>
            </v-speed-dial>
          </v-btn>

          <v-btn icon="mdi-feather" size="small" v-tooltip:bottom="'Recaps'">
            <v-icon></v-icon>
            <v-speed-dial activator="parent" location="left center" transition="scale-transition" open-on-hover>
                <v-btn v-for="(item, i) in filterEditActions('recaps')" :key="i" v-tooltip:bottom="item.tooltip" icon="" @click="handleEditAction(item)">
                  <v-icon>{{item.icon}}</v-icon>
                  <v-icon size="15" class="position-absolute" style="bottom: 0; right: 0;">{{item.editIcon}}</v-icon>
                </v-btn>
            </v-speed-dial>
          </v-btn>
      </v-speed-dial>
    </v-btn>
  </v-toolbar>
</template>

<script setup>
import { inject, ref } from 'vue'

const nodeFilter = inject('nodeFilter')
const editMode = inject('editMode')
const placingPOI = inject('placingPOI')
const placingPOIType = inject('placingPOIType')
const placingMarker = inject('placingMarker')
const linkingPoints = inject('linkingPoints')

const locationTypes = inject('locationTypes')
const editActions = ref([])
for(let locationType of locationTypes?.value)
{
  for(let allowedAction of locationType.allowedActions)
  {
    let tooltipPrefix = ''
    let editIcon = ''
    let editAction = ''
    let icon = locationType.icon
    if (allowedAction == 'add'){
      tooltipPrefix = 'Add'
      editIcon = 'mdi-plus-circle'

      if (locationType.nodeFilter == 'poi')
        editAction = 'addPoi'
      else if (locationType.nodeFilter == 'recaps')
        editAction = 'addRecap'
    }
    else if (allowedAction == 'link'){
      tooltipPrefix = 'Link'
      editIcon = 'mdi-link-circle'
      icon = 'mdi-arrow-top-right-bottom-left'
      
      if (locationType.nodeFilter == 'recaps')
        editAction = 'linkRecap'
    }
    else if (allowedAction == 'group'){
      tooltipPrefix = 'Group'
      editIcon = 'mdi-arrange-bring-to-front'
      
      if (locationType.nodeFilter == 'recaps')
        editAction = 'groupRecap'
    }

    editActions?.value.push({
      icon: icon, 
      nodeType: locationType.type, 
      nodeFilter: locationType.nodeFilter, 
      tooltip: `${tooltipPrefix} ${locationType.name}`, 
      editIcon: editIcon, 
      action: editAction
    })
  }
}

const filterEditActions = (filter) => {
  return editActions?.value.filter(x => (nodeFilter?.value == 'all' || nodeFilter?.value == filter) && x.nodeFilter == filter)
}

const handleEditAction = (editAction) => {
  editMode.value = true
  switch(editAction.action){
    case 'addPoi':
      placingPOI.value = true
      placingPOIType.value = editAction.nodeType
      break
    case 'addRecap':
      placingMarker.value = true
      break
    case 'linkRecap':
      linkingPoints.value = true
      break
    case 'groupRecap':
      placingMarker.value = true
      placingPOIType.value = 'group'
      break
  }
  console.log(editAction.icon + "clicked!")
}

const toggleEdit = () => {
  if (!editMode.value) {
      if (isAuthenticated.value) {
          editMode.value = true
      } else {
          showLoginModal.value = true
      }
    } else {
    editMode.value = false
  }
}

</script>

<style scoped>

.page-layout {
  margin: 0 auto;
  width: 1292.4px;
}

.horizontal-controls {
  position: relative;
  margin: 0 auto;
  width: 1292.4px;
  padding-bottom: 10px;
  display: flex;
  gap: 15px;
}

.edit-controls {
  display: flex;
  flex-direction: row-reverse;
  width: stretch;
}

</style>