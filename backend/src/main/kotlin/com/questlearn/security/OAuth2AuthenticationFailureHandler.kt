package com.questlearn.security

import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder

/**
 * OAuth2 Authentication Failure Handler
 * 
 * Handles failed Google OAuth2 authentication attempts.
 * Redirects to frontend with error information.
 */
@Component
class OAuth2AuthenticationFailureHandler(
    @Value("\${app.oauth2.authorized-redirect-uris}")
    private val authorizedRedirectUris: String
) : SimpleUrlAuthenticationFailureHandler() {

    private val logger = LoggerFactory.getLogger(OAuth2AuthenticationFailureHandler::class.java)

    override fun onAuthenticationFailure(
        request: HttpServletRequest,
        response: HttpServletResponse,
        exception: AuthenticationException
    ) {
        logger.error("OAuth2 authentication failed", exception)
        
        val redirectUri = authorizedRedirectUris.split(",")[0].trim()
        val targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
            .queryParam("error", "authentication_failed")
            .queryParam("message", exception.localizedMessage)
            .build()
            .toUriString()
        
        redirectStrategy.sendRedirect(request, response, targetUrl)
    }
}
