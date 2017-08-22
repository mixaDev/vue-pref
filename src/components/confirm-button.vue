<template>
  <span @click.stop.prevent='onClick'><slot></slot></span>
</template>

<script>
export default {
  props:['onConfirm', 'confirmText', 'item'],
  methods:{
    onClick(){
      if (confirm(this.confirmText))
        this.onConfirm(this.item)
    }
  }
}
</script>
