pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        CI = 'true'
        NODE_VERSION = '20.18.0'
        // Node hasil download dipasang lewat symlink node-dist di workspace
        PATH = "${WORKSPACE}/node-dist/bin:${PATH}"
    }

    stages {
        stage('Setup Node.js') {
            steps {
                sh '''
                    set -e
                    ARCH=$(uname -m)
                    case "$ARCH" in
                        x86_64)  NODE_ARCH=x64 ;;
                        aarch64) NODE_ARCH=arm64 ;;
                        *) echo "Arsitektur tidak didukung: $ARCH"; exit 1 ;;
                    esac

                    DIR="node-v${NODE_VERSION}-linux-${NODE_ARCH}"

                    if [ ! -d "$DIR" ]; then
                        echo "Mengunduh Node.js ${NODE_VERSION} (${NODE_ARCH})..."
                        curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/${DIR}.tar.gz" -o node.tar.gz
                        tar -xzf node.tar.gz
                        rm -f node.tar.gz
                    fi

                    ln -sfn "$DIR" node-dist
                '''
            }
        }

        stage('Check Environment') {
            steps {
                sh 'node -v'
                sh 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    if [ -f package-lock.json ]; then
                        npm ci --include=dev
                    else
                        npm install --include=dev
                    fi
                '''
            }
        }

        stage('Lint & Type Check') {
            steps {
                sh 'npm run check --if-present'
                sh 'npm run lint --if-present'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run test --if-present'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }

    post {
        success {
            echo 'Build SvelteKit berhasil.'
        }
        failure {
            echo 'Build gagal. Cek log di atas.'
        }
    }
}