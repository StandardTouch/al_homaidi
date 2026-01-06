import { createRouter, createWebHistory } from 'vue-router'
import { usersStore } from './stores/user'
import { sessionStore } from './stores/session'

const routes = [
	{
		path: '/',
		name: 'Home',
		component: () => import('@/pages/Dashboard.vue'),
	},
	{
		path: '/shops',
		name: 'ShopsList',
		component: () => import('@/pages/ShopsList.vue'),
	}
]

let router = createRouter({
	history: createWebHistory('/rental'),
	routes,
})

router.beforeEach(async (to, from, next) => {
	const { userResource } = usersStore()
	let { isLoggedIn } = sessionStore()

	try {
		if (isLoggedIn) {
			await userResource.promise
		}
	} catch (error) {
		isLoggedIn = false
	}

	if (!isLoggedIn) {
		window.location.href = "/login?redirect-to=/rental";
	}
	return next()
})

export default router
