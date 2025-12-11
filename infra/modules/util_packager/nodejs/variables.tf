###########
# General
###########

variable "entry_file_path" {
  type        = string
  description = "Path of the entry file (handler) for the Lambda function. Must be a valid JavaScript/TypeScript file path."

  validation {
    condition     = can(regex("\\.(js|mjs|cjs|ts)$", var.entry_file_path))
    error_message = "Entry file must be a JavaScript or TypeScript file (.js, .mjs, .cjs, or .ts)."
  }
}

variable "export_dir" {
  type        = string
  description = "Path of the export directory where packaged files will be placed. Must be a valid directory path."
}

###########
# Source Files
###########

variable "source_dirs" {
  type        = list(string)
  description = "List of additional source directories or files to include in the package. These will be copied to the export directory alongside the entry file."
  default     = []
}

variable "package_json_path" {
  type        = string
  description = "Path to the package.json file. If not specified, the packager will look for package.json in the entry file's directory."
  default     = null
}

###########
# Build Configuration
###########

variable "build_command" {
  type        = string
  description = "Command to run before packaging (e.g., 'npm run build' for TypeScript compilation). This will be executed in the directory containing package.json."
  default     = null
}

variable "build_dir" {
  type        = string
  description = "Directory containing built files to package. If specified, files will be copied from this directory instead of source_dirs. Useful for TypeScript projects where you want to package the compiled output."
  default     = null
}

###########
# Dependencies
###########

variable "no_deps" {
  type        = bool
  description = "Whether to skip installing node_modules dependencies. If true, only source files will be copied."
  default     = false
}
