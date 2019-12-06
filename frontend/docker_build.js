/**
 * Docker build cross platform script for KF Metadata
 * This will calculate your current hash, and build date and use them
 * to build the docker image in the format:
 * 
 * gcr.io/kubeflow-images-public/metadata-frontend:${COMMIT_HASH}
 */
const {exec, spawn} = require('child_process')
const runCmd = cmd => new Promise((res, rej) => exec(cmd, (e, out, err) => e?rej(e):res({out, err})))

const main = async _ => {
    const commitHash = (await runCmd('git rev-parse HEAD')).out.trim()
    const date = new Date().toUTCString()
    const dockerProcess = spawn(
        'docker', [
            `build`,
            `-t`,`gcr.io/kubeflow-images-public/metadata-frontend:${commitHash}`,
            `--build-arg`,`COMMIT_HASH=${commitHash}`,
            `--build-arg`,`DATE="${date}"`,
            `.`
        ], {shell: true}
    );
    dockerProcess.stdout.on('data', buffer => console.log(buffer.toString()))
    dockerProcess.stderr.on('data', buffer => console.error(buffer.toString()))
    dockerProcess.on('close', code => {
        if (code) return
        console.log(`Docker image built!`)
    })
}

main()
