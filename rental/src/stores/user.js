import { defineStore } from 'pinia'
import { createResource } from 'frappe-ui'


export const usersStore = defineStore('rental-users', () => {
    let userResource = createResource({
        url: 'al_homaidi.homaidi.api.get_user_info',
        onError(error) {
            if (error && error.exc_type === 'AuthenticationError') {
				window.location.href = '/login'
			} 
        },
        auto: true,
    })

	return {
		userResource,
	}
}) 