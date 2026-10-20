pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        CI = 'true'
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                // npm ci butuh package-lock.json; kalau tidak ada, pakai npm install
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
                // Tidak menggagalkan build jika script tidak tersedia
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
        always {
            cleanWs(deleteDirs: true, disableDeferredWipeout: true)
        }
    }
}