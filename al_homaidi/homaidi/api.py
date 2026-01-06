import frappe
from frappe import _


@frappe.whitelist()
def get_user_info():
    if frappe.session.user == "Guest":
        return None
    
    user = frappe.db.get_value(
        "User",
        frappe.session.user,
        ["name", "email", "enabled", "user_image", "full_name", "first_name", "last_name", "user_type", "username"],
        as_dict=True,
    )

    user["roles"] = frappe.get_roles(user.name)
    return user

@frappe.whitelist(allow_guest=True)
def get_branding():
	"""Get branding details."""
	website_settings = frappe.get_single("Website Settings")
	image_fields = ["banner_image", "footer_logo", "favicon"]

	for field in image_fields:
		if website_settings.get(field):
			file_info = get_file_info(website_settings.get(field))
			website_settings.update({field: json.loads(json.dumps(file_info))})
		else:
			website_settings.update({field: None})

	return website_settings

@frappe.whitelist(allow_guest=True)
def get_rental_management_settings():
	allowed_fields = [
		"disable_pwa",
	]

	settings = frappe._dict()
	for field in allowed_fields:
		settings[field] = True

	return settings

@frappe.whitelist()
def get_file_info(file_url):
	"""Get file info for the given file URL."""
	file_info = frappe.db.get_value(
		"File", {"file_url": file_url}, ["file_name", "file_size", "file_url"], as_dict=1
	)
	return file_info
