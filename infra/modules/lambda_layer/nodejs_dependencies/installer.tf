data "external" "install_dependencies" {
  program = [
    "sh",
    "-c",
    <<-EOF
    set -e
    rm -rf ${var.source_dir}
    mkdir -p ${var.source_dir}/nodejs
    cp ${var.package_json_path} ${var.source_dir}/nodejs/package.json
    if [ -f ${local.package_lock_path} ]; then
      cp ${local.package_lock_path} ${var.source_dir}/nodejs/package-lock.json
    fi
    cd ${var.source_dir}/nodejs
    npm install --omit=dev --no-audit --no-fund > /dev/null 2>&1
    echo '{"result": "success"}'
    EOF
  ]
}