<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

onLaunch(() => {
  console.log('App Launch - 苍穹战纪')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
page {
  background-color: #1a1a2e;
  color: #eaeaea;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

view {
  box-sizing: border-box;
}

button {
  outline: none;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
}
</style>