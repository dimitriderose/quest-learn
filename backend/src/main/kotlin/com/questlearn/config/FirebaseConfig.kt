package com.questlearn.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.cloud.firestore.Firestore
import com.google.cloud.firestore.FirestoreOptions
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.cloud.FirestoreClient
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.io.FileInputStream

/**
 * Firebase Configuration for QuestLearn Backend
 * 
 * Supports two modes:
 * 1. Development: Firebase Emulator (no credentials needed)
 * 2. Production: Real Firebase (requires credentials)
 * 
 * Configuration is controlled via environment variables:
 * - FIRESTORE_EMULATOR_HOST: If set, uses emulator mode
 * - FIREBASE_PROJECT_ID: Firebase project ID
 * - FIREBASE_CREDENTIALS_PATH: Path to service account JSON (production only)
 */
@Configuration
class FirebaseConfig {

    private val logger = LoggerFactory.getLogger(FirebaseConfig::class.java)

    @Value("\${FIREBASE_PROJECT_ID:demo-questlearn}")
    private lateinit var projectId: String

    @Value("\${FIRESTORE_EMULATOR_HOST:}")
    private lateinit var emulatorHost: String

    @Value("\${questlearn.firebase.credentials-path:}")
    private lateinit var credentialsPath: String

    @Bean
    fun firestore(): Firestore {
        logger.info("Initializing Firestore...")
        logger.debug("FIREBASE_PROJECT_ID: $projectId")
        logger.debug("FIRESTORE_EMULATOR_HOST: ${if (emulatorHost.isBlank()) "<not set>" else emulatorHost}")
        
        return if (emulatorHost.isNotBlank()) {
            logger.info("🔧 Using Firebase Emulator at: $emulatorHost")
            createEmulatorFirestore()
        } else {
            logger.info("🔥 Using Production Firebase")
            createProductionFirestore()
        }
    }

    /**
     * Creates Firestore instance connected to Firebase Emulator
     * Used for local development - no credentials required
     */
    private fun createEmulatorFirestore(): Firestore {
        try {
            val options = FirestoreOptions.newBuilder()
                .setProjectId(projectId)
                .setHost(emulatorHost)
                .setCredentials(GoogleCredentials.none())
                .build()

            val firestore = options.service
            logger.info("✅ Connected to Firestore Emulator successfully")
            return firestore
        } catch (e: Exception) {
            logger.error("❌ Failed to connect to Firestore Emulator", e)
            throw IllegalStateException("Could not initialize Firestore Emulator. " +
                "Make sure Firebase Emulator is running at: $emulatorHost", e)
        }
    }

    /**
     * Creates Firestore instance connected to Production Firebase
     * Requires valid credentials
     */
    private fun createProductionFirestore(): Firestore {
        try {
            val credentials = if (credentialsPath.isNotBlank()) {
                logger.info("Loading Firebase credentials from: $credentialsPath")
                FileInputStream(credentialsPath).use { serviceAccount ->
                    GoogleCredentials.fromStream(serviceAccount)
                }
            } else {
                logger.info("Using default application credentials (GOOGLE_APPLICATION_CREDENTIALS)")
                GoogleCredentials.getApplicationDefault()
            }

            val options = FirebaseOptions.builder()
                .setProjectId(projectId)
                .setCredentials(credentials)
                .build()

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options)
                logger.info("✅ Initialized Firebase App")
            }

            val firestore = FirestoreClient.getFirestore()
            logger.info("✅ Connected to Production Firestore successfully")
            return firestore
        } catch (e: Exception) {
            logger.error("❌ Failed to connect to Production Firestore", e)
            throw IllegalStateException("Could not initialize Production Firestore. " +
                "Please check your Firebase credentials configuration.", e)
        }
    }
}
