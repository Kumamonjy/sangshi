export function navigateBackToHome(): void {
  uni.redirectTo({ url: '/pages/index/index' })
}

export function navigateBackToStart(): void {
  uni.redirectTo({ url: '/pages/start/start' })
}

export function navigateBackOrHome(): void {
  const pages = getCurrentPages()
  
  if (pages.length <= 1) {
    navigateBackToHome()
    return
  }
  
  const currentPage = pages[pages.length - 1]
  const currentRoute = '/' + currentPage.route
  
  if (currentRoute === '/pages/index/index') {
    navigateBackToStart()
  } else {
    uni.navigateBack({
      fail: () => {
        navigateBackToHome()
      }
    })
  }
}