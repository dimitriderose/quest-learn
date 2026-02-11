package com.questlearn.security

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import java.util.*
import javax.crypto.SecretKey

/**
 * JWT Token Provider
 * 
 * Handles generation and validation of JWT tokens for stateless authentication.
 * Tokens contain user ID, email, and role claims.
 */
@Component
class JwtTokenProvider(
    @Value("\${app.jwt.secret}")
    private val jwtSecret: String,
    
    @Value("\${app.jwt.expiration-ms}")
    private val jwtExpirationMs: Long
) {
    
    private val logger = LoggerFactory.getLogger(JwtTokenProvider::class.java)
    
    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(jwtSecret.toByteArray())
    }
    
    /**
     * Generate JWT token for a user
     * @param classId optional class ID for students who logged in with a class code
     */
    fun generateToken(userId: String, email: String, role: String, classId: String? = null): String {
        val now = Date()
        val expiryDate = Date(now.time + jwtExpirationMs)

        val builder = Jwts.builder()
            .subject(userId)
            .claim("email", email)
            .claim("role", role)
            .issuedAt(now)
            .expiration(expiryDate)

        if (classId != null) {
            builder.claim("classId", classId)
        }

        return builder
            .signWith(key, Jwts.SIG.HS512)
            .compact()
    }
    
    /**
     * Extract user ID from JWT token
     */
    fun getUserIdFromToken(token: String): String {
        val claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
            
        return claims.subject
    }
    
    /**
     * Extract email from JWT token
     */
    fun getEmailFromToken(token: String): String? {
        val claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
            
        return claims["email"] as? String
    }
    
    /**
     * Extract role from JWT token
     */
    fun getRoleFromToken(token: String): String? {
        val claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload

        return claims["role"] as? String
    }

    /**
     * Extract classId from JWT token (for students who logged in with a class code)
     */
    fun getClassIdFromToken(token: String): String? {
        val claims = Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload

        return claims["classId"] as? String
    }
    
    /**
     * Validate JWT token
     * Returns true if token is valid, false otherwise
     */
    fun validateToken(token: String): Boolean {
        return try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
            true
        } catch (ex: SecurityException) {
            logger.error("Invalid JWT signature")
            false
        } catch (ex: MalformedJwtException) {
            logger.error("Invalid JWT token")
            false
        } catch (ex: ExpiredJwtException) {
            logger.error("Expired JWT token")
            false
        } catch (ex: UnsupportedJwtException) {
            logger.error("Unsupported JWT token")
            false
        } catch (ex: IllegalArgumentException) {
            logger.error("JWT claims string is empty")
            false
        }
    }
}
