import { createRouter, createWebHistory } from 'vue-router'
import { session } from './data/session'
import { userResource } from '@/data/user'
import { useAppStore } from '@/stores/index';
import appSetting from '@/app-setting';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import ('@/pages/Home.vue'),
    meta: {
		  requiresLogin: true
	  }
  },
]

let router = createRouter({
  history: createWebHistory('/rental'),
  linkExactActiveClass: 'active',
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
        return savedPosition;
    } else {
        return { left: 0, top: 0 };
    }
  },
})

router.beforeEach(async (to, from, next) => {
  let isLoggedIn = session.isLoggedIn
  const store = useAppStore();
  try {
    await userResource.promise
  } catch (error) {
    isLoggedIn = false
  }

	if (to.meta.requiresLogin && !isLoggedIn) {
		// throw them to login page
		window.location.href = "/login?redirect-to=/rental";
	}
  store.setMainLayout('app');
	next();
})

router.afterEach((to, from, next) => {
  appSetting.changeAnimation();
});

export default router
