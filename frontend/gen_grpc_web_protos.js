const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');

const PROTOC_GEN_TS_PATH = path.join(__dirname, 'node_modules', '.bin', 'protoc-gen-ts');
const OUT_DIR = path.join(__dirname, 'src', 'generated');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, {
    recursive: true
  });
}

// Expects protoc to be on your PATH.
// From npm/google-protobuf:
// The compiler is not currently available via npm, but you can download a
// pre-built binary on GitHub (look for the protoc-*.zip files under Downloads).
const protocProcess = spawn(
    'protoc', [
      `--plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}"`,
      `--js_out="import_style=commonjs,binary:${OUT_DIR}"`,
      `--ts_out="service=grpc-web:${OUT_DIR}"`,
      'src/apis/**/*.proto'
    ], {
      // Allow wildcards in glob to be interpreted
      shell: true
    }
);
protocProcess.stdout.on('data', buffer => console.log(buffer.toString()));
protocProcess.stderr.on('data', buffer => console.error(buffer.toString()));
protocProcess.on('close', code => {
  if (!code) {
    console.log(`Protos succesfully generated.`)
  }
});

