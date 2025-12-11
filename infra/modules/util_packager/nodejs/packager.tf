data "external" "packager_program" {
  program = flatten([
    "node", "${path.module}/packager.js",
    var.entry_file_path,
    "--export-dir", var.export_dir,
    length(var.source_dirs) > 0 ? flatten(["--source-dirs", var.source_dirs]) : [],
    var.package_json_path != null ? ["--package-json", var.package_json_path] : [],
    var.build_command != null ? ["--build-command", var.build_command] : [],
    var.build_dir != null ? ["--build-dir", var.build_dir] : [],
    var.no_deps ? ["--no-deps"] : []
  ])
}
