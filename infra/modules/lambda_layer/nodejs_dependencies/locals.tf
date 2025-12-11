locals {
  # Compute package-lock.json path from package.json path if not explicitly provided
  package_lock_path = var.package_lock_path != null ? var.package_lock_path : replace(var.package_json_path, "package.json", "package-lock.json")
}
