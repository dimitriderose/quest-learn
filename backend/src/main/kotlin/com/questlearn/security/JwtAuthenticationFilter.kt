package com.questlearn.security

import com.questlearn.service.UserService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import org.springframework.web.filter.OncePerRequestFilter

/**
 * JWT Authentication Filter
 * 
 * Intercepts every request to validate JWT tokens and set authentication in SecurityContext.
 * Runs once per request and checks Authorization header for Bearer tokens.
 */
@Component
class JwtAuthenticationFilter(
    private val jwtTokenProvider: JwtTokenProvider,
    private val userService: UserService
) : OncePerRequestFilter() {

    private val logger = LoggerFactory.getLogger(JwtAuthenticationFilter::class.java)

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        try {
            val jwt = getJwtFromRequest(request)
            
            if (jwt != null && jwtTokenProvider.validateToken(jwt)) {
                val userId = jwtTokenProvider.getUserIdFromToken(jwt)

                // Load user from database
                val user = userService.getUserById(userId)

                // Extract classId from token (present for students who logged in with a class code)
                val classId = jwtTokenProvider.getClassIdFromToken(jwt)
                if (classId != null) {
                    request.setAttribute("classId", classId)
                }

                // Create authentication with ROLE_ prefix for Spring Security
                val authorities = listOf(SimpleGrantedAuthority("ROLE_${user.role}"))
                val authentication = UsernamePasswordAuthenticationToken(
                    user,
                    null,
                    authorities
                )
                authentication.details = WebAuthenticationDetailsSource().buildDetails(request)

                // Set authentication in security context
                SecurityContextHolder.getContext().authentication = authentication

                logger.debug("Set authentication for user: ${user.email}, role: ${user.role}, classId: $classId")
            }
        } catch (ex: Exception) {
            logger.error("Could not set user authentication in security context", ex)
        }
        
        filterChain.doFilter(request, response)
    }
    
    /**
     * Extract JWT token from Authorization header or query parameter.
     * Header format: "Bearer <token>"
     * Query parameter: ?token=<token> (used for SSE endpoints where EventSource can't set headers)
     */
    private fun getJwtFromRequest(request: HttpServletRequest): String? {
        val bearerToken = request.getHeader("Authorization")
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7)
        }

        val tokenParam = request.getParameter("token")
        if (StringUtils.hasText(tokenParam)) {
            return tokenParam
        }

        return null
    }
}
