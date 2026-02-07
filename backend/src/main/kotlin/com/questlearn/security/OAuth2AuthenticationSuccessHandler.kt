package com.questlearn.security

import com.questlearn.model.User
import com.questlearn.model.UserRole
import com.questlearn.service.UserService
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.oauth2.core.user.OAuth2User
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

/**
 * OAuth2 Authentication Success Handler
 * 
 * Handles successful Google OAuth2 authentication.
 * Extracts user info from Google, creates/updates user in database,
 * generates JWT token, and redirects to frontend with token.
 */
@Component
class OAuth2AuthenticationSuccessHandler(
    private val jwtTokenProvider: JwtTokenProvider,
    private val userService: UserService,
    @Value("\${app.oauth2.authorized-redirect-uris}")
    private val authorizedRedirectUris: String,
    @Value("\${app.oauth2.allowed-domains:}")
    private val allowedDomains: String?
) : SimpleUrlAuthenticationSuccessHandler() {

    private val logger = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler::class.java)

    override fun onAuthenticationSuccess(
        request: HttpServletRequest,
        response: HttpServletResponse,
        authentication: Authentication
    ) {
        val oauth2User = authentication.principal as OAuth2User
        
        // Extract user info from Google
        val email = oauth2User.getAttribute<String>("email")
        val name = oauth2User.getAttribute<String>("name")
        val picture = oauth2User.getAttribute<String>("picture")
        
        if (email == null || name == null) {
            logger.error("Email or name is null from OAuth2 user")
            val errorUrl = getRedirectUrl("error", "missing_user_info")
            redirectStrategy.sendRedirect(request, response, errorUrl)
            return
        }
        
        logger.info("Google OAuth2 login successful for email: $email")
        
        // Optional: Validate email domain
        if (!isAllowedDomain(email)) {
            logger.warn("Unauthorized domain for email: $email")
            val errorUrl = getRedirectUrl("error", "unauthorized_domain")
            redirectStrategy.sendRedirect(request, response, errorUrl)
            return
        }
        
        // Find or create user
        val user = userService.findByEmail(email) ?: createTeacherUser(email, name, picture)
        
        // Update last login
        userService.updateLastLogin(user.uid)
        
        // Generate JWT token
        val token = jwtTokenProvider.generateToken(user.uid, user.email, user.role.name)
        
        logger.info("Generated JWT token for user: ${user.email}")
        
        // Redirect to frontend with token
        val targetUrl = getRedirectUrl("token", token)
        redirectStrategy.sendRedirect(request, response, targetUrl)
    }
    
    private fun createTeacherUser(email: String, name: String, picture: String?): User {
        logger.info("Creating new teacher user for email: $email")
        return userService.createUser(
            email = email,
            displayName = name,
            photoURL = picture,
            role = UserRole.TEACHER
        )
    }
    
    /**
     * Check if email domain is allowed
     * If no restrictions configured (allowedDomains is null/empty), allow all
     */
    private fun isAllowedDomain(email: String): Boolean {
        // No restrictions = allow all Google accounts
        if (allowedDomains.isNullOrBlank()) {
            logger.debug("No domain restrictions - allowing all Google accounts")
            return true
        }
        
        val domain = email.substringAfter("@").lowercase()
        val allowedList = allowedDomains.split(",").map { it.trim().lowercase() }
        
        // Check exact match or suffix match (e.g., ".edu" matches "school.edu")
        val isAllowed = allowedList.any { allowed ->
            domain == allowed || 
            domain.endsWith(".$allowed") ||
            domain.endsWith(allowed)
        }
        
        logger.debug("Domain check for $domain: ${if (isAllowed) "allowed" else "denied"}")
        return isAllowed
    }
    
    /**
     * Build redirect URL with query parameter
     */
    private fun getRedirectUrl(paramName: String, paramValue: String): String {
        val redirectUri = authorizedRedirectUris.split(",")[0].trim()
        return UriComponentsBuilder.fromUriString(redirectUri)
            .queryParam(paramName, paramValue)
            .build()
            .toUriString()
    }
}
