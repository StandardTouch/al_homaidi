/**
 * Data Service for managing local JSON data storage
 * This service handles reading and writing to data.json file
 * For demo purposes, uses localStorage for persistence
 */

const STORAGE_KEY = 'rental_data'

/**
 * Read data from data.json file or localStorage
 * @returns {Promise<Object>} Data object containing shops and shopRents arrays
 */
export async function readData() {
	try {
		// First try to read from localStorage
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem(STORAGE_KEY)
			if (stored) {
				try {
					const data = JSON.parse(stored)
					return {
						shops: data.shops || [],
						shopRents: data.shopRents || [],
						users: data.users || [],
					}
				} catch (error) {
					console.error('Error parsing stored data:', error)
				}
			}
		}
		
		// Fallback to reading from data.json file
		const response = await fetch('/rental/data.json')
		if (response.ok) {
			const data = await response.json()
			const result = {
				shops: data.shops || [],
				shopRents: data.shopRents || [],
				users: data.users || [],
			}
			// Sync to localStorage
			if (typeof window !== 'undefined') {
				localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
			}
			return result
		}
	} catch (error) {
		console.error('Error reading data:', error)
	}
	
	// Return empty data structure
	return {
		shops: [],
		shopRents: [],
		users: [],
	}
}

/**
 * Write data to localStorage
 * Note: In a browser environment, we can't directly write to files
 * This function stores data in localStorage for demo purposes
 * @param {Object} data - Data object containing shops and shopRents arrays
 * @returns {Promise<boolean>} Success status
 */
export async function writeData(data) {
	try {
		if (typeof window !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
			return true
		}
		return false
	} catch (error) {
		console.error('Error writing data:', error)
		return false
	}
}

/**
 * Get shops from data
 * @returns {Promise<Array>} Array of shops
 */
export async function getShops() {
	const data = await readData()
	return data.shops
}

/**
 * Get shop rents from data
 * @returns {Promise<Array>} Array of shop rents
 */
export async function getShopRents() {
	const data = await readData()
	return data.shopRents
}

/**
 * Add a new shop
 * @param {Object} shop - Shop object
 * @returns {Promise<Object>} Created shop with ID
 */
export async function addShop(shop) {
	const data = await readData()
	const newShop = {
		id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		...shop,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}
	data.shops.push(newShop)
	await writeData(data)
	return newShop
}

/**
 * Update an existing shop
 * @param {string} id - Shop ID
 * @param {Object} updates - Shop updates
 * @returns {Promise<Object|null>} Updated shop or null if not found
 */
export async function updateShop(id, updates) {
	const data = await readData()
	const index = data.shops.findIndex((shop) => shop.id === id)
	if (index === -1) {
		return null
	}
	data.shops[index] = {
		...data.shops[index],
		...updates,
		updated_at: new Date().toISOString(),
	}
	await writeData(data)
	return data.shops[index]
}

/**
 * Delete a shop
 * @param {string} id - Shop ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteShop(id) {
	const data = await readData()
	const index = data.shops.findIndex((shop) => shop.id === id)
	if (index === -1) {
		return false
	}
	data.shops.splice(index, 1)
	// Also delete related shop rents
	data.shopRents = data.shopRents.filter((rent) => rent.shop_id !== id)
	await writeData(data)
	return true
}

/**
 * Add a new shop rent
 * @param {Object} shopRent - Shop rent object
 * @returns {Promise<Object>} Created shop rent with ID
 */
export async function addShopRent(shopRent) {
	const data = await readData()
	const newShopRent = {
		id: `rent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		...shopRent,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}
	data.shopRents.push(newShopRent)
	await writeData(data)
	return newShopRent
}

/**
 * Add multiple shop rents (for bulk operations)
 * @param {Array<Object>} shopRents - Array of shop rent objects
 * @returns {Promise<Array>} Array of created shop rents
 */
export async function addShopRents(shopRents) {
	const data = await readData()
	const newShopRents = shopRents.map((shopRent) => ({
		id: `rent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		...shopRent,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}))
	data.shopRents.push(...newShopRents)
	await writeData(data)
	return newShopRents
}

/**
 * Update an existing shop rent
 * @param {string} id - Shop rent ID
 * @param {Object} updates - Shop rent updates
 * @returns {Promise<Object|null>} Updated shop rent or null if not found
 */
export async function updateShopRent(id, updates) {
	const data = await readData()
	const index = data.shopRents.findIndex((rent) => rent.id === id)
	if (index === -1) {
		return null
	}
	data.shopRents[index] = {
		...data.shopRents[index],
		...updates,
		updated_at: new Date().toISOString(),
	}
	await writeData(data)
	return data.shopRents[index]
}

/**
 * Delete a shop rent
 * @param {string} id - Shop rent ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteShopRent(id) {
	const data = await readData()
	const index = data.shopRents.findIndex((rent) => rent.id === id)
	if (index === -1) {
		return false
	}
	data.shopRents.splice(index, 1)
	await writeData(data)
	return true
}

/**
 * Get shop by ID
 * @param {string} id - Shop ID
 * @returns {Promise<Object|null>} Shop object or null if not found
 */
export async function getShopById(id) {
	const data = await readData()
	return data.shops.find((shop) => shop.id === id) || null
}

/**
 * Get users from data
 * @returns {Promise<Array>} Array of users
 */
export async function getUsers() {
	const data = await readData()
	return data.users
}

/**
 * Add a new user
 * @param {Object} user - User object
 * @returns {Promise<Object>} Created user with ID
 */
export async function addUser(user) {
	const data = await readData()
	const newUser = {
		id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
		...user,
		created_at: new Date().toISOString(),
		updated_at: new Date().toISOString(),
	}
	data.users.push(newUser)
	await writeData(data)
	return newUser
}

/**
 * Update an existing user
 * @param {string} id - User ID
 * @param {Object} updates - User updates
 * @returns {Promise<Object|null>} Updated user or null if not found
 */
export async function updateUser(id, updates) {
	const data = await readData()
	const index = data.users.findIndex((user) => user.id === id)
	if (index === -1) {
		return null
	}
	data.users[index] = {
		...data.users[index],
		...updates,
		updated_at: new Date().toISOString(),
	}
	await writeData(data)
	return data.users[index]
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteUser(id) {
	const data = await readData()
	const index = data.users.findIndex((user) => user.id === id)
	if (index === -1) {
		return false
	}
	data.users.splice(index, 1)
	await writeData(data)
	return true
}

/**
 * Get user by ID
 * @param {string} id - User ID
 * @returns {Promise<Object|null>} User object or null if not found
 */
export async function getUserById(id) {
	const data = await readData()
	return data.users.find((user) => user.id === id) || null
}

/**
 * Initialize data from localStorage if available
 * This ensures data persists across page refreshes
 */
export function initializeData() {
	if (typeof window !== 'undefined') {
		const stored = localStorage.getItem('rental_data')
		if (stored) {
			try {
				const data = JSON.parse(stored)
				// Optionally sync with data.json on initialization
				return data
			} catch (error) {
				console.error('Error parsing stored data:', error)
			}
		}
	}
	return null
}
