output "result" {
  value       = data.external.packager_program.result
  description = "Result from the Node.js packager containing build information."
}

output "build_directory" {
  value       = data.external.packager_program.result.build_directory
  description = "Path to the directory containing the packaged Lambda function."
}
